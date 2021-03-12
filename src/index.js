const express = require("express");

const { v4: uuid } = require("uuid");

const app = express();

app.use(express.json());

const repositories = [];

function checkRepositoryExists(request, response, next) {
  const { id } = request.params;

  const repository = repositories.find((repository) => repository.id === id);

  if (!repository) {
    return response.status(404).json({ error: "Repository not found" });
  }

  request.repository = repository;

  return next();
}

function checkEmptyParameters(request, response, next) {
  const { title, url, techs } = request.body;
  const { repository } = request;

  request.repository = repository;
  request.title = title;
  request.url = url;
  request.techs = techs;

  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  repositories.push(repository);

  return response.status(204).json(repository);
});

app.put("/repositories/:id", checkRepositoryExists, (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const { repository } = request;

  const repositoryIndex = repositories.findIndex((repository) => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(404).json({ error: "Repository not found" });
  }

  const updatedRepository = {
    title,
    url,
    techs
  };

  if (title === "") {
    delete updatedRepository.title;
  }
  if (url === "") {
    delete updatedRepository.url;
  }
  if (techs === "") {
    delete updatedRepository.techs;
  }

  const repos = { ...repositories[repositoryIndex], ...updatedRepository };

  repositories[repositoryIndex] = repos;

  return response.json(repos);
});

app.delete("/repositories/:id", checkRepositoryExists, (request, response) => {
  const { repository } = request;

  const repositoryIndex = repositories.indexOf(repository);

  if (repositoryIndex === -1) {
    return response.status(404).json({ error: "Repository not found!" });
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", checkRepositoryExists, (request, response) => {
  const { id } = request.params;
  const { repository } = request;

  const likes = ++repository.likes;

  return response.json(repository);
});

module.exports = app;
