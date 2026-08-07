PACKAGE REQUIREMENTS
Here is the list of packages or modules that you need to download using npm install
for this project...

bcryptjs (for password hashing)
connect-mongo (for MongoDB session storage)
express (web framework)
express-session (session management)
file-type (file type detection)
mongodb (MongoDB driver)
mongoose (ODM for MongoDB)
multer (file upload handling)
nodemon (auto-restart on changes)
npm install dotenv(for our environment variables to securley connect us to the outsourced database)
GridFS(to help save pdf books)
import dotenv from 'dotenv'
dotenv.config()



MONGODB SETUP
- Be sure to run 'brew tap mongodb/brew' to let homebrew know where to look for your
mongodb
- Run 'brew install mongodb-community' to install the latest version of mongodb-community
- Run 'brew services start mongodb-community' in order to actually run the mongodb so that you can begin connecting to the database
- Use'brew services list" to check and make sure that the mongodb is running on your device
- We also will be using atlas compass to host our databse for us as well


SIDE NOTES
- The login process is acting a little weird as you have to login twice in order to have an actual session 