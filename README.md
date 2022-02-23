# LexiClean: An annotation tool for rapid multi-task lexical normalisation

LexiClean is a rapid annotation tool for acquiring parallel corpora for lexical normalisation built with the full-stack web-based framework MERN (MongoDB-Express-React-Node). A live demonstration of the tool can be found at https://lexiclean.nlp-tlp.org and a systems demonstration video at https://youtu.be/P7_ooKrQPDU.

### Dependencies
LexiClean requires both MongoDB and Node.js (*Express and React are bundled with Node.js*)

- MongoDB (v4.4.6) (see: https://docs.mongodb.com/manual/installation/)
- Node.js (v14.17.1) (see: https://nodejs.org/en/download/)

## How to install (standard)
LexiClean can be built and served locally once the dependencies are met. First, install MongoDB by following the url specified above. Once installed, in a new terminal, check that it is running as a service using:

    $ service mongod status
  
If should have an *active* status.

<!-- ```$ brew services list```  for macOS-->


Next, clone this repository into a folder and navigate to the root of the directory:

    $ git clone https://github.com/nlp-tlp/lexiclean.git
    $ cd lexiclean

After this, install LexiCleans back-end *server* and front-end *client* dependencies using `npm`. For the client, navigate to `./client` using `$ cd ./client` in your terminal. Server dependencies will be installed at the root (`/`) level.

    $ npm install


Once the dependencies have been succesfully installed, environmental variables for the database connection and authorisation system need to be set. In the root directory (`/`) add an `.env` file with the structure shown below. This can be done using a text editor or `vi .env` in linux.
  
    DB_HOST=localhost
    DB_PORT=27017
    DB_NAME=lexiclean
    TOKEN_SECRET=<secret_key>

The `<secret_key>` should be strong (see: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx).

Now you're ready to populate the database with an English lexicon and start annotating! To populate the database with the English lexicon (`en_lexicon.json`), navigate to the root directory (`/`) in LexiClean. Ensure that your `.env` is set-up correctly before commencing this step. When ready, run the following command in your terminal:

    $ node en_lexicon_insert.js


###
After installation of LexiClean, launch the application from the root directory (`/`) by running:

    $ npm run app


## How to install (docker)
LexiClean can be built using Docker. To do so, in the parent directory, execute:
```
$ make run
```

or alternatively:
```
$ docker-compose -f docker-compose.yml up
```

## Attribution
Please cite our [[conference paper]](https://aclanthology.org/2021.emnlp-demo.25/) if you find it useful in your research:
```
@inproceedings{bikaun2021lexiclean,
  title={LexiClean: An annotation tool for rapid multi-task lexical normalisation},
  author={Bikaun, Tyler and French, Tim and Hodkiewicz, Melinda and Stewart, Michael and Liu, Wei},
  booktitle={Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing: System Demonstrations},
  pages={212--219},
  year={2021}
}
```

## Feedback
Please email any feedback or questions to Tyler Bikaun (tyler.bikaun@research.uwa.edu.au)
