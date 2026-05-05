import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import Admin from '../models/Admin';
import Warden from '../models/Warden';

export const configurePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            },
            async (accessToken, refreshToken, profile, done) => {
                const { id, displayName, emails, photos } = profile;
                const email = emails?.[0].value;

                try {
                    // 1. Search in all collections for existing googleId
                    let user = await User.findOne({ googleId: id }) || 
                               await Admin.findOne({ googleId: id }) || 
                               await Warden.findOne({ googleId: id });
                    
                    if (!user && email) {
                        // 2. Search in all collections for existing email
                        const existingUser = await User.findOne({ email });
                        const existingAdmin = await Admin.findOne({ email });
                        const existingWarden = await Warden.findOne({ email });
                        
                        user = existingUser || existingAdmin || existingWarden;

                        if (user) {
                            // Link googleId to existing user/admin/warden
                            user.googleId = id;
                            await (user as any).save();
                        } else {
                            // 3. Create new user ONLY if not found anywhere (default to student)
                            user = await User.create({
                                name: displayName,
                                email: email,
                                googleId: id,
                                role: 'student',
                                profile: {
                                    profileImage: photos?.[0].value,
                                    isVerified: false
                                }
                            });
                        }
                    }

                    if (user) {
                        return done(null, user);
                    } else {
                        return done(new Error('Failed to authenticate with Google'), undefined);
                    }
                } catch (error) {
                    return done(error as Error, undefined);
                }
            }
        )
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id) || await Admin.findById(id) || await Warden.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};
