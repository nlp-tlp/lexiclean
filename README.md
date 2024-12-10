# LexiClean: An annotation tool for rapid multi-task lexical normalisation

[![Live Demo](https://img.shields.io/badge/-Live%20Demo-brightgreen?style=flat&logo=firefoxbrowser&logoColor=white)](https://lexiclean.tech)
[![Documentation](https://img.shields.io/badge/-Documentation-blue?style=flat&logo=github&logoColor=white)](https://docs.lexiclean.tech)
[![Video Demo](https://img.shields.io/badge/-Video%20Demo-red?style=flat&logo=youtube&logoColor=white)](https://youtu.be/P7_ooKrQPDU)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-supported-brightgreen.svg)](https://www.docker.com/)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit)](https://github.com/pre-commit/pre-commit)


> [!IMPORTANT]
> LexiClean v2 is currently being released. While it is currently testable, an updated video walk through is still pending and will be re-released ASAP. In the meantime, please consult the original systems demonstration or documentation for more information.

LexiClean is a rapid annotation tool for acquiring parallel corpora for lexical normalisation built with MongoDB, React and FastAPI.
<<<<<<< HEAD
=======

📌 **Quick Links:**

- [Live Demo](https://lexiclean.nlp-tlp.org)
- [Demo Video](https://youtu.be/P7_ooKrQPDU)
>>>>>>> 39dc557 (chore: update README for clarity and formatting improvements)

![Annotation Interface](./client/public/static/annotation_interface_light.png)

## 📦 Dependencies

To run LexiClean using Docker, you'll need:

- Docker Engine (see: https://docs.docker.com/engine/install/)
- Docker Compose (see: https://docs.docker.com/compose/install/)

## 🚀 Quick Start with Docker Compose

1. Clone the repository:

```bash
git clone https://github.com/nlp-tlp/lexiclean.git
cd lexiclean
```

2. Start the application:

```bash
docker compose up --build
```

### Available Services

| Service       | URL                   | Description        |
| ------------- | --------------------- | ------------------ |
| Frontend      | http://localhost:3000 | User interface     |
| Backend API   | http://localhost:8000 | API server         |
| Documentation | http://localhost:4000 | User documentation |
| MongoDB       | localhost:27018       | Database           |

## 🏗️ Architecture

The application consists of four main services:

- Frontend (React): User interface running on port 3000
- Backend (FastAPI): API server running on port 8000
- MongoDB: Database running on port 27018
- Documentation (React, Docasaurus): Service running on port 4000

## ⚙️ Environment Variables

### Backend (FastAPI)

```env
MONGODB__URI=mongodb://root:example@mongodb:27017/lexiclean?authSource=admin
MONGODB__DB_NAME=lexiclean
AUTH__SECRET_KEY=secret
AUTH__ALGORITHM=HS256
AUTH__ACCESS_TOKEN_EXPIRE_MINUTES=360
API__PREFIX=/api
```

### Frontend

```env
VITE_API_URL=http://localhost:8000/api
VITE_DOCS_URL=http://localhost:4000
VITE_GITHUB_URL=https://github.com/nlp-tlp/lexiclean
NODE_ENV=development
```

### MongoDB

```env
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=example
```

## 🛠️ Manual Installation

If you prefer to run the application without Docker, follow these steps:

1. Install MongoDB (v4.4.6 or later):

- Follow the [official MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

2. Verify MongoDB is running:

```bash
service mongod status
```

3. Install dependencies:

```bash
# Install backend dependencies
cd server
pip install -r requirements.txt

# Install frontend dependencies
cd ../client
npm install

# Optional: Install documentation dependencies
cd ../docs
npm install
```

4. Set up environment variables using the `.env.example` files as examples

5. Start the services manually:

```bash
# Start backend
cd server
uvicorn main:app --reload

# Start frontend (in a new terminal)
cd client
npm run dev

# Optiona: Start the documentation server (in a new terminal)
cd docs
npm run start
```

## 📝 Attribution

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

## 📫 Feedback

Please email any feedback or questions to Tyler Bikaun (tyler.bikaun@research.uwa.edu.au)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

### Bug Reports & Feature Requests

- Open an issue using the appropriate template
- Provide clear description and steps to reproduce (for bugs)
- Include relevant environment details or examples

### Pull Requests

1. Fork and create a branch
2. Make changes following our code style
3. Test your changes
4. Submit a PR with a clear description
