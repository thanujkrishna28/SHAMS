import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import User from '../models/User';
import Warden from '../models/Warden';
import generateToken from '../utils/generateToken';

// In-memory challenge store (Use Redis for production)
const challenges: Map<string, string> = new Map();

const RP_NAME = 'SHAMS Hostel Management';
const RP_ID = 'localhost';
const ORIGIN = 'http://localhost:5173';

/**
 * @desc    Generate registration options for a user
 * @route   POST /api/webauthn/register-options
 * @access  Private
 */
export const getRegisterOptions = asyncHandler(async (req: any, res: Response) => {
    const user = req.user;
    if (!user) {
        res.status(401);
        throw new Error('Not authorized');
    }

    console.log(`[WebAuthn] Generating registration options for: ${user.email}`);

    try {
        const options = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: RP_ID,
            userID: Buffer.from(user._id.toString()), // ✅ Convert to Buffer for library compatibility
            userName: user.email,
            userDisplayName: user.name || user.email.split('@')[0],
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'required',
                requireResidentKey: true,
                userVerification: 'required',
                authenticatorAttachment: 'platform', 
            },
        });

        challenges.set(user._id.toString(), options.challenge);
        console.log(`[WebAuthn] Challenge generated and stored for: ${user._id}`);
        res.json(options);
    } catch (error: any) {
        console.error('[WebAuthn Error] Failed to generate options:', error);
        res.status(500).json({ 
            message: 'Internal Server Error during WebAuthn setup',
            error: error.message 
        });
    }
});

/**
 * @desc    Verify registration response
 * @route   POST /api/webauthn/register-verify
 * @access  Private
 */
export const verifyRegistration = asyncHandler(async (req: any, res: Response) => {
    const user = req.user;
    const body = req.body;

    const expectedChallenge = challenges.get(user._id.toString());
    if (!expectedChallenge) {
        res.status(400);
        throw new Error('Challenge not found');
    }

    try {
        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credential } = verification.registrationInfo;

            const newCredential = {
                credentialID: Buffer.from(credential.id).toString('base64'),
                publicKey: Buffer.from(credential.publicKey).toString('base64'),
                counter: credential.counter,
                deviceType: 'platform',
                transports: body.response.transports || [],
            };

            if (user.role === 'student') {
                await User.findByIdAndUpdate(user._id, {
                    $push: { 'profile.webauthnCredentials': newCredential }
                });
            } else {
                await Warden.findByIdAndUpdate(user._id, {
                    $push: { 'profile.webauthnCredentials': newCredential }
                });
            }

            challenges.delete(user._id.toString());
            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false, error: 'Verification failed' });
        }
    } catch (error: any) {
        console.error('WebAuthn Registration Error:', error);
        res.status(400).json({ verified: false, error: error.message });
    }
});

/**
 * @desc    Generate authentication options (Login)
 * @route   POST /api/webauthn/login-options
 * @access  Public
 */
export const getLoginOptions = asyncHandler(async (req: Request, res: Response) => {
    // No email needed in body for discoverable credentials!
    const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: [], // ✅ Empty array = device discovers credentials
        userVerification: 'required', // ✅ Forces biometric/PIN
    });

    // Store challenge with a generic key since we don't know the user yet
    challenges.set('login-challenge', options.challenge);
    res.json(options);
});

/**
 * @desc    Verify authentication response (Login)
 * @route   POST /api/webauthn/login-verify
 * @access  Public
 */
export const verifyLogin = asyncHandler(async (req: Request, res: Response) => {
    const { response } = req.body;

    console.log('[WebAuthn] Starting login verification...');

    const expectedChallenge = challenges.get('login-challenge');
    if (!expectedChallenge) {
        console.error('[WebAuthn Error] Login challenge not found in memory');
        res.status(400);
        throw new Error('Challenge not found or expired');
    }

    try {
        // With discoverable credentials, the client response contains the userHandle (our UserID)
        // We need to decode it as it's often sent as a Base64 string
        let userId = response.response.userHandle;
        
        if (!userId) {
            console.error('[WebAuthn Error] No userHandle in response');
            res.status(400);
            throw new Error('User identity not found in credential');
        }

        // Convert base64url to string if needed
        if (typeof userId === 'string') {
            userId = Buffer.from(userId, 'base64').toString();
        }

        console.log(`[WebAuthn] Searching for user: ${userId}`);

        let dbUser: any = await User.findById(userId);
        if (!dbUser) {
            dbUser = await Warden.findById(userId);
        }

        if (!dbUser) {
            console.error(`[WebAuthn Error] User not found: ${userId}`);
            res.status(400);
            throw new Error('User not found');
        }

        // Find the credential, but be flexible with Base64 encoding differences (+/- and //_)
        const credential = dbUser.profile?.webauthnCredentials?.find(
            (cred: any) => {
                const storedId = cred.credentialID.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                const incomingId = response.id.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                return storedId === incomingId;
            }
        );

        if (!credential) {
            console.error(`[WebAuthn Error] Credential ${response.id} not found on account ${userId}`);
            console.log('[WebAuthn Debug] Stored Credentials:', dbUser.profile?.webauthnCredentials?.map((c: any) => c.credentialID));
            res.status(400);
            throw new Error('Credential not found on this account');
        }

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            credential: {
                id: credential.credentialID,
                publicKey: Buffer.from(credential.publicKey, 'base64'),
                counter: credential.counter,
            },
        });

        if (verification.verified) {
            // Update counter
            if (dbUser.role === 'student') {
                await User.updateOne(
                    { _id: dbUser._id, 'profile.webauthnCredentials.credentialID': response.id },
                    { $set: { 'profile.webauthnCredentials.$.counter': verification.authenticationInfo.newCounter } }
                );
            } else {
                await Warden.updateOne(
                    { _id: dbUser._id, 'profile.webauthnCredentials.credentialID': response.id },
                    { $set: { 'profile.webauthnCredentials.$.counter': verification.authenticationInfo.newCounter } }
                );
            }

            challenges.delete('login-challenge');
            console.log(`[WebAuthn] User ${dbUser.email} logged in successfully via biometrics`);

            res.json({
                verified: true,
                user: {
                    _id: dbUser._id,
                    name: dbUser.name,
                    email: dbUser.email,
                    role: dbUser.role,
                    profile: dbUser.profile,
                    token: generateToken(dbUser._id.toString()),
                }
            });
        } else {
            console.error('[WebAuthn Error] Verification failed for user:', dbUser.email);
            res.status(400).json({ verified: false, error: 'Verification failed' });
        }
    } catch (error: any) {
        console.error('[WebAuthn Error] Exception during login verify:', error);
        res.status(500).json({ verified: false, error: error.message });
    }
});
