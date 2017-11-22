# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.7.18)
# Database: project_two
# Generation Time: 2017-11-21 01:32:15 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table transactionsAvg
# ------------------------------------------------------------

DROP TABLE IF EXISTS `transactionsAvg`;

CREATE TABLE `transactionsAvg` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `coin` varchar(4) NOT NULL DEFAULT '',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cost` decimal(11,2) NOT NULL,
  `price` decimal(11,2) NOT NULL,
  `units` decimal(11,2) NOT NULL,
  `total_cost` decimal(11,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `transactionsAvg` WRITE;
/*!40000 ALTER TABLE `transactionsAvg` DISABLE KEYS */;

INSERT INTO `transactionsAvg` (`id`, `user_id`, `coin`, `date`, `cost`, `price`, `units`, `total_cost`)
VALUES
	(22,1,'ETH','2017-11-06 13:45:43',100.00,100.00,50.00,5000.00),
	(23,1,'ETH','2017-11-06 13:47:31',120.00,120.00,25.00,3000.00),
	(24,1,'ETH','2017-11-06 13:47:42',160.00,160.00,25.00,4000.00),
	(25,1,'ETH','2017-11-06 13:47:51',200.00,200.00,10.00,2000.00),
	(26,1,'ETH','2017-11-06 14:18:43',-127.27,250.00,-25.00,-3181.82),
	(27,1,'ETH','2017-11-06 14:21:05',-127.27,200.00,-10.00,-1272.73),
	(28,1,'ETH','2017-11-06 14:21:31',250.00,250.00,20.00,5000.00),
	(29,1,'ETH','2017-11-06 14:21:42',-153.11,300.00,-35.00,-5358.85),
	(33,1,'BTC','2017-11-06 15:37:50',6990.00,6990.00,2.13,631.28),
	(34,1,'ETH','2017-11-06 15:37:50',-153.11,297.08,-50.00,-7655.50);

/*!40000 ALTER TABLE `transactionsAvg` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table transactionsFIFO
# ------------------------------------------------------------

DROP TABLE IF EXISTS `transactionsFIFO`;

CREATE TABLE `transactionsFIFO` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `coin` varchar(4) NOT NULL DEFAULT '',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cost` decimal(11,2) NOT NULL,
  `price` decimal(11,2) NOT NULL,
  `units` decimal(11,2) NOT NULL,
  `total_cost` decimal(11,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `transactionsFIFO` WRITE;
/*!40000 ALTER TABLE `transactionsFIFO` DISABLE KEYS */;

INSERT INTO `transactionsFIFO` (`id`, `user_id`, `coin`, `date`, `cost`, `price`, `units`, `total_cost`)
VALUES
	(1,1,'ETH','2017-11-06 13:45:43',100.00,100.00,50.00,5000.00),
	(2,1,'ETH','2017-11-06 13:47:31',120.00,120.00,25.00,3000.00),
	(3,1,'ETH','2017-11-06 13:47:42',160.00,160.00,25.00,4000.00),
	(4,1,'ETH','2017-11-06 13:47:51',200.00,200.00,10.00,2000.00),
	(5,1,'ETH','2017-11-06 14:18:43',-100.00,250.00,-25.00,-2500.00),
	(6,1,'ETH','2017-11-06 14:21:05',-100.00,200.00,-10.00,-1000.00),
	(7,1,'ETH','2017-11-06 14:21:31',250.00,250.00,20.00,5000.00),
	(8,1,'ETH','2017-11-06 14:21:42',-111.43,300.00,-35.00,-3900.00),
	(10,1,'BTC','2017-11-06 15:37:50',6990.00,6990.00,2.13,631.28),
	(11,1,'ETH','2017-11-06 15:37:50',-190.00,297.08,-50.00,-9500.00);

/*!40000 ALTER TABLE `transactionsFIFO` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table transactionsLIFO
# ------------------------------------------------------------

DROP TABLE IF EXISTS `transactionsLIFO`;

CREATE TABLE `transactionsLIFO` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `coin` varchar(4) NOT NULL DEFAULT '',
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cost` decimal(11,2) NOT NULL,
  `price` decimal(11,2) NOT NULL,
  `units` decimal(11,2) NOT NULL,
  `total_cost` decimal(11,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `transactionsLIFO` WRITE;
/*!40000 ALTER TABLE `transactionsLIFO` DISABLE KEYS */;

INSERT INTO `transactionsLIFO` (`id`, `user_id`, `coin`, `date`, `cost`, `price`, `units`, `total_cost`)
VALUES
	(1,1,'ETH','2017-11-06 13:45:43',100.00,100.00,50.00,5000.00),
	(2,1,'ETH','2017-11-06 13:47:31',120.00,120.00,25.00,3000.00),
	(3,1,'ETH','2017-11-06 13:47:42',160.00,160.00,25.00,4000.00),
	(4,1,'ETH','2017-11-06 13:47:51',200.00,200.00,10.00,2000.00),
	(5,1,'ETH','2017-11-06 14:18:43',-176.00,250.00,-25.00,-4400.00),
	(6,1,'ETH','2017-11-06 14:21:05',-160.00,200.00,-10.00,-1600.00),
	(7,1,'ETH','2017-11-06 14:21:31',250.00,250.00,20.00,5000.00),
	(8,1,'ETH','2017-11-06 14:21:42',-194.29,300.00,-35.00,-6800.00),
	(10,1,'BTC','2017-11-06 15:37:50',6990.00,6990.00,2.13,631.28),
	(11,1,'ETH','2017-11-06 15:37:50',-106.00,297.08,-50.00,-5300.00);

/*!40000 ALTER TABLE `transactionsLIFO` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
