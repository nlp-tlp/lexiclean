# Lexiclean: An open-source annotation tool for rapid multi-task lexical normalisation
## Overview
This repository contains associated code for the conference paper `Lexiclean - Multi-task Lexical Normalisation`. An online demonstration of the tool can be found at https://lexiclean.nlp-tlp.org.

<!-- ![pipeline image](https://code-ittc.csiro.au/tyler.bikaun/mtbf_from_mwo/-/raw/master/model_overview.png) -->

## Requirements
Software requirements of Lexiclean include mongodb and node.js. Lexiclean is built using the MERN stack (Mongo-Express-React-Node). Note: Express and React are bundled with Node.js.

- MongoDB v4.4.6 (see: https://docs.mongodb.com/manual/installation/)
- Node.js (v14.17.1) (see: https://nodejs.org/en/download/)

## Installation
Lexiclean can be built and served locally (see *Requirements* for software requirements). 

#### Client
In the `/client` directory run the following command `npm install`

#### Server
In the root directory `/` run the following command `npm install`

#### Environment variables
In the root directory `/` add an `.env` file with the structure shown below. The `TOKEN_SECRET` value `<secret_key>` should be strong (see: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx).
```
DB_CONNECTION=mongodb://localhost:27017/lexiclean
TOKEN_SECRET=<secret_key>
```


## Usage
After installation of Lexiclean, launch the application by running `npm run app` from the root directory `/`.

## Attribution
Please cite our [[conference paper]](https://arxiv.org/abs/####.#####) (to appear in xxxxx## 202#) if you find it useful in your research:
```
  @inproceedings{bikaun202xlexiclean,
      title={Lexiclean: An open-source annotation tool for rapid multi-task lexical normalisation},
      author={Bikaun, Tyler, French, Tim, Hodkiewicz, Melinda, Stewart, Michael and Liu, Wei},
      journal={xxxx, xxxxx ####.},
      pages={x--y},
      year={202#}
}
```

## Contact
Please email any questions or queries to Tyler Bikaun (tyler.bikaun@research.uwa.edu.au)
