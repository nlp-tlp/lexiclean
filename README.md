# LexiClean: An annotation tool for rapid multi-task lexical normalisation

LexiClean is a rapid annotation tool for acquiring parallel corpora for lexical normalisation built with the full-stack web-based framework MERN (MongoDB-Express-React-Node). A live demonstration of the tool can be found at https://lexiclean.nlp-tlp.org and a systems demonstration video at https://youtu.be/P7_ooKrQPDU.

### Dependencies
LexiClean requires both MongoDB and Node.js (*Express and React are bundled with Node.js*)

- MongoDB (v4.4.6) (see: https://docs.mongodb.com/manual/installation/)
- Node.js (v14.17.1) (see: https://nodejs.org/en/download/)

## How to install
LexiClean can be built and served locally once the dependencies are met. First, install MongoDB by following the url specified above. Once installed, in a new terminal, check that it is running as a service using:

    $ service mongod status
  
If should have an *active* status.

Next, clone this repository into a folder and navigate to the root of the directory:

    $ git clone https://github.com/nlp-tlp/lexiclean.git
    $ cd lexiclean

After this, install LexiCleans back-end *server* and front-end *client* dependencies using `npm`. For the client, navigate to `./client` using `$ cd ./client` in your terminal. Server dependencies will be installed at the root (`/`) level.

    $ npm install


Once the dependencies have been succesfully installed, environmental variables for the database connection and authorisation system need to be set. In the root directory (`/`) add an `.env` file with the structure shown below. This can be done using a text editor or `vi .env` in linux.
  
    DB_CONNECTION=mongodb://localhost:27017/lexiclean
    TOKEN_SECRET=<secret_key>

The `<secret_key>` should be strong (see: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx).

Now you're ready to populate the database with an English lexicon and start annotating! To populate the database with the English lexicon (`en_lexicon.json`), navigate to the root directory (`/`) in LexiClean. Ensure that your `.env` is set-up correctly before commencing this step. When ready, run the following command in your terminal:

    $ node en_lexicon_insert.js


###
After installation of LexiClean, launch the application from the root directory (`/`) by running:

    $ npm run app



## Attribution
Please cite our [[conference paper]](https://arxiv.org/abs/####.#####) (to appear in xxxxx## 202#) if you find it useful in your research:
```
  @inproceedings{bikaun202xlexiclean,
      title={LexiClean: An annotation tool for rapid multi-task lexical normalisation},
      author={Bikaun, Tyler, French, Tim, Hodkiewicz, Melinda, Stewart, Michael and Liu, Wei},
      journal={xxxx, xxxxx ####.},
      pages={x--y},
      year={202#}
}
```

## Contact
Please email any questions or queries to Tyler Bikaun (tyler.bikaun@research.uwa.edu.au)
