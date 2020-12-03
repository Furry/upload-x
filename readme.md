# Upload-x

Currently, I've impletemented

- Account Creation
- Token Authorization
- Token Re-Creation
- Account fetching
- Account property updating
- Image based uploading

# To-Do

- Improve code base
- Make MongoDB & encription optional
- Validate & parse domain update requests

# Account Creation:

For account creation, a JSON payload is sent to the webserver with both the username and the password for the account. Once recieved, the webserver checks to see if the username is taken, if not, it moves foward. The password is then hashed with the SHA-256 algorithem, and salted with the current timestamp.

Once done, the hash of the password and the current timestamp are stored in the database, along with a generated Token.

# Account Login:

To log into an account, a JSON payload is sent to the webserver with both the username and password for the account. The webserver then checks to see if the username exists, if so, it hashes the password with the timestamp in the user's account as a salt. If the stored hash and the newly generated hash are identicle, it creates a new Token.

# Token Generation:

Token generation is mostly random, but is a Base64 encoded JSON object, 
{
    stamp: New Unix Time Stamp
    name: User's Username
    rand: 32 bits of randomly generated text to verify uniqueness
}
This token is then used for authorization in the future, the timestamp along with it allows for server-side expiration dates.
