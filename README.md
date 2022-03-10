# Chat Socket.IO

Un chat créé avec [Socket.IO](https://socket.io/),
accessible en local sur navigateur
et sur une app [Electron](https://www.electronjs.org/).

## Sommaire

- [Setup](#setup)
- [Utilisation](#utilisation)
- [Fonctionnalités](#fonctionnalités)

## Setup

Dépendances à installer :

- Electron (dépendance de développement)
- Express
- nodemon
- socket.io

## Utilisation

Vous pouvez lancer le serveur avec la commande suivante :
`npm start`

et l'application Electron avec la commande suivante :
`npm run electron`

## Fonctionnalités

Liste des commandes :

- Pouvoir créer une room `/create <roomName>`
- Pouvoir rejoindre une room `/join <roomName>`
- Pouvoir lister les rooms existantes `/list`

Spécificités :

- Seules les personnes présentes dans la room peuvent se parler entre elles.
- En cas de double join la room précédente est quittée.
