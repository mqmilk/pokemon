# pokemon
You need to run npm install. For development purpose, create a .env file in the main folder with the MAPBOX_TOKEN for mapbox. 
To deploy the app, you have to set up the enviroment by yourself, like the PORT number, the mongo database url in Atlas. 
For test, we use local computer to create mongoDB and have another url. 
Run node app.js(in the main directory), you should be able to check the website on http://localhost:3000/. 
You can CRUD(create, read, update, delete) pokemons in the website. 
You can see all the existed Pokemon through Lists on the navbar. You can click the name of one Pokemon to check the details.
You can see all the Pokemons with the same type by clicking the specific type.
You can test your knowledge by guessing the name of a Pokemon through a random generated picute, and the name will be shown in 3 seconds. You can read more details about this Pokemon by clicking the name.
Authentication and authorization are needed for some features(like create new pokemons, edit the existed pokemon, or delete a existed pokemon). 
For the uploaded files(images), you use your computer as a local server to save them and when you delete an image, the related saved file will be deleted in the backend as well. 
