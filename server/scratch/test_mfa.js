const otplib = require('otplib');
const { NobleCryptoPlugin, ScureBase32Plugin } = otplib;

try {
    console.log('Testing otplib v13 functional API...');
    
    const secret = otplib.generateSecret({
        crypto: new NobleCryptoPlugin(),
        base32: new ScureBase32Plugin()
    });
    console.log('Secret generated:', secret);
    
    const uri = otplib.generateURI({
        label: 'test@user.com',
        issuer: 'Smart HMS',
        secret: secret,
        strategy: 'totp'
    });
    console.log('URI generated:', uri);
    
    const QRCode = require('qrcode');
    QRCode.toDataURL(uri, (err, url) => {
        if (err) {
            console.error('QRCode failed:', err);
        } else {
            console.log('QRCode generated successfully!');
            console.log('All tests passed!');
        }
    });
} catch (error) {
    console.error('Test failed!');
    console.error(error);
}
