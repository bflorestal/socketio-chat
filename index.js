const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const port = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let roomList = [];

io.on("connection", (socket) => {
  // Connexion
  console.log(`Un utilisateur s'est connecté (ID : ${socket.id})`);
  socket.emit("chat message", `👋 Bonjour ! Votre ID : ${socket.id}`);
  // Message envoyé aux autres utilisateurs indiquant que quelqu'un s'est connecté
  socket.broadcast.emit(
    "chat message",
    `🚪 Un utilisateur s'est connecté (ID : ${socket.id})`
  );

  // Un utilisateur envoie un message
  socket.on("chat message", (msg) => {
    // Signale à l'utilisateur qu'il doit être dans une room
    if (roomList.length === 0) {
      socket.emit(
        "chat message",
        "⚠️ Vous devez rejoindre une room pour utiliser le chat."
      );
      return;
    }

    // Variable qui va contenir la room de l'utilisateur
    let roomResult = {};

    // Donne la room de l'utilisateur
    roomList.forEach((room) => {
      if (room.users.includes(socket.id)) {
        roomResult = room;
        /* Met le message de l'utilisateur dans la liste des messages de la room
        room.messages.push(msg); */
      }
    });

    if (!roomResult.users) {
      socket.emit(
        "chat message",
        "⚠️ Vous devez rejoindre une room pour utiliser le chat."
      );
      return;
    }

    // Envoie le message à tous les utilisateurs de la room
    roomResult.users.forEach((userId) => {
      io.to(userId).emit("chat message", msg);
    });
  });

  // Commande envoyée
  socket.on("command", (msg) => {
    const [cmd, ...arg] = msg.split(" ");

    switch (cmd) {
      case "/create": {
        // Nom de room manquant dans la commande
        if (!arg[0]) {
          socket.emit("chat message", "⚠️ Il manque le nom de la room !");
          socket.emit("chat message", `⌨️ Syntaxe : ${cmd} <room>`);
          return;
        }

        // Room déjà existante
        const roomExists = roomList.find((room) => room.name === arg[0]);
        if (roomExists) {
          socket.emit("chat message", `⚠️ ${roomExists.name} existe déjà.`);
          return;
        }

        // Création de la room
        const newRoom = {
          messages: [],
          name: arg[0].toLowerCase(),
          userCount: 0,
          users: [],
        };

        // Ajoute de la room à la liste des rooms
        roomList.push(newRoom);

        // Feedback
        socket.emit("chat message", `🪧 Room ${newRoom.name} créée.`);
        console.log(
          `Room ${newRoom.name} créée par un utilisateur (${socket.id})`
        );
        break;
      }

      case "/list": {
        if (roomList.length > 0) {
          // Initialisation d'un array contenant le nom des rooms
          let roomsToShow = [];

          // Ajout du noms des rooms dans l'array
          roomList.forEach((room) => {
            roomsToShow.push(room.name);
          });

          // Affichage de la liste des rooms
          socket.emit(
            "chat message",
            `🪧 Liste des rooms : ${roomsToShow.join(", ")}`
          );
          // Affichage de la liste dans la console
          console.log(`Liste demandée par un utilisateur (${socket.id}) :`);
          console.log(roomList);
        } else {
          socket.emit("chat message", "⚠️ La liste des rooms est vide.");
        }
        break;
      }

      case "/join": {
        // Nom de room manquant dans la commande
        if (!arg[0]) {
          socket.emit("chat message", "⚠️ Il manque le nom de la room !");
          socket.emit("chat message", `⌨️ Syntaxe : ${cmd} <room>`);
          return;
        }
        // 0 room existante
        if (roomList.length === 0) {
          socket.emit("chat message", "⚠️ Aucune room n'a été créée.");
        }

        // Boucle qui parcourt la liste des rooms
        roomList.forEach((room) => {
          // Empêche l'utilisateur de rejoindre une room s'il est déjà dedans
          if (
            room.name === arg[0] &&
            room.users.find((userId) => userId === socket.id)
          ) {
            socket.emit(
              "chat message",
              `⚠️ Vous êtes déjà dans la room ${room.name} !`
            );
            return;
          } else {
            // Enlève l'utilisateur de la liste des utilisateurs de la room
            if (room.users.includes(socket.id)) {
              room.users = room.users.filter((user) => user !== socket.id);
              room.userCount--;

              // Prévient les autres qu'il a quitté la room
              room.users.forEach((userId) => {
                io.to(userId).emit(
                  "chat message",
                  `🚪 ${socket.id} a quitté ${room.name}.`
                );
              });
            }

            // Si la room existe, alors l'utilisateur peut la rejoindre
            if (room.name === arg[0].toLowerCase()) {
              // Ajout de l'utilisateur à la liste des utilisateurs de la room
              room.users.push(socket.id);
              room.userCount++;

              // Feedback
              socket.emit("chat message", `🪧 Bienvenue dans ${room.name} !`);

              room.users.forEach((userId) => {
                if (userId !== socket.id) {
                  io.to(userId).emit(
                    "chat message",
                    `🚪 ${socket.id} a rejoint ${room.name}.`
                  );
                }
              });

              console.log(
                `Un utilisateur (${socket.id}) a rejoint ${room.name}.`
              );
            }
          }
        });

        break;
      }

      /*
      case "/roomusers": {
        // Affiche la liste des utilisateurs présents dans la même room
        roomList.map((currentRoom) => {
          currentRoom.users.find((userID) => userID === socket.id) &&
            socket.emit(
              "chat message",
              `🔎 Utilisateurs dans la room : ${room.users.join(", ")}`
            );
        });
      }
      */
    }
  });

  // Déconnexion
  socket.on("disconnect", () => {
    if (roomList.length > 0) {
      roomList.forEach((room) => {
        // Si l'utilisateur était dans une room, l'enlever de la liste des utilisateurs de la room
        if (room.users.includes(socket.id)) {
          room.users = room.users.filter((user) => user !== socket.id);
          room.userCount--;
        }
      });
    }

    // Feedback
    console.log(`Un utilisateur s'est déconnecté (ID: ${socket.id})`);
    socket.broadcast.emit(
      "chat message",
      `🚪 Un utilisateur s'est déconnecté (ID: ${socket.id})`
    );
  });
});

server.listen(port, () => {
  console.log(`À l'écoute sur http://localhost:${port}`);
});
