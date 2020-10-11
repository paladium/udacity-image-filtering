import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';
export function requireAuth(req: Request, res: Response, next: NextFunction){
    if(!req.headers || !req.headers.authorization){
        return res.status(401).send({message: "Authorization header required"});
    }
    const basicAuth = req.headers.authorization.split(" ");
    if(basicAuth.length != 2){
        return res.status(401).send({message: "Invalid token"});
    }
    const authToken = basicAuth[1];
    //Decode the token using base64 and split using :
    const decodedToken = Buffer.from(authToken, "base64").toString().split(":");
    if(decodedToken.length != 2){
        return res.status(401).send({message: "Invalid token"});
    }
    const [username, password] = decodedToken;
    if(username != "test" || password != "test"){
        return res.status(401).send({message: "Invalid credentials"});
    }
    return next();
};

(async () => {

    // Init the Express application
    const app = express();

    // Set the network port
    const port = process.env.PORT || 8082;

    // Use the body parser middleware for post requests
    app.use(bodyParser.json());

    // GET /filteredimage?image_url={{URL}}
    // endpoint to filter an image from a public url.
    // IT SHOULD
    //    1
    //    1. validate the image_url query
    //    2. call filterImageFromURL(image_url) to filter the image
    //    3. send the resulting file in the response
    //    4. deletes any files on the server on finish of the response
    // QUERY PARAMATERS
    //    image_url: URL of a publicly accessible image
    // RETURNS
    //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

    /**************************************************************************** */

    app.get("/filteredimage", requireAuth, async (req, res) => {
        const { image_url } = req.query;
        if (!image_url || image_url == "") {
            res.status(400).send("image_url is required");
            return;
        }
        const filteredImage = await filterImageFromURL(image_url);
        res.sendFile(filteredImage, () => {
            //Delete the file
            deleteLocalFiles([filteredImage]);
        });
    });

    // Root Endpoint
    // Displays a simple message to the user
    app.get("/", async (req, res) => {
        res.send("try GET /filteredimage?image_url={{}}")
    });


    // Start the Server
    app.listen(port, () => {
        console.log(`server running http://localhost:${port}`);
        console.log(`press CTRL+C to stop server`);
    });
})();