<div align="center">
  <img src="https://raw.githubusercontent.com/bflorestal/socketio-chat/main/public/favicon/android-chrome-512x512.png" width="100" alt="Logo" />
</div>
<h1 align="center">
  Chat Socket.io
</h1>
<p align="center">
  Un chat créé avec <a href="https://socket.io/" target="_blank">Socket.IO</a>, accessible en local sur navigateur et sur une app <a href="https://www.electronjs.org/" target="_blank">Electron</a>.
</p>

## Sommaire

- [Setup](#setup)
- [Utilisation](#utilisation)
- [Fonctionnalités](#fonctionnalités)

## Setup

Dépendances à installer :

- [Electron](https://www.electronjs.org/fr) (dépendance de développement)
- [Express](https://expressjs.com/fr/)
- [nodemon](https://github.com/remy/nodemon)
- [Socket.IO](https://socket.io/fr/)

## Utilisation

Vous pouvez lancer le serveur avec la commande suivante :
`npm start`

et l'application Electron avec la commande suivante :
`npm run electron`

## Fonctionnalités

**Liste des commandes :**

- Pouvoir créer une room `/create <roomName>`
- Pouvoir rejoindre une room `/join <roomName>`
- Pouvoir lister les rooms existantes `/list`

**Spécificités :**

- Il faut être dans une room pour envoyer des messages.
- Seules les personnes présentes dans la room peuvent se parler entre elles.
- En cas de double join la room précédente est quittée.
