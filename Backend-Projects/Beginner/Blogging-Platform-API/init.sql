CREATE DATABASE `db`;

CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `content` text NOT NULL,
  `category` text NOT NULL,
  `tags` text NOT NULL,
  PRIMARY KEY (`id`)
)
