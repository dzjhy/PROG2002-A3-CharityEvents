CREATE DATABASE  IF NOT EXISTS `charityevents_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `charityevents_db`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: charityevents_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(50) NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Fun Run'),(2,'Gala'),(3,'Auction'),(4,'Concert');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `event_name` varchar(100) NOT NULL,
  `description` text,
  `event_date` date NOT NULL,
  `city` varchar(100) NOT NULL,
  `location` varchar(150) NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `category_id` int NOT NULL,
  `organisation_id` int NOT NULL,
  PRIMARY KEY (`event_id`),
  KEY `category_id` (`category_id`),
  KEY `organisation_id` (`organisation_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`),
  CONSTRAINT `events_ibfk_2` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`organisation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Sydney Charity Fun Run','A community fun run to raise funds for local families in need.','2026-10-20','Sydney','Centennial Park',25.00,1,1,1),(2,'Melbourne Community Run','A community fun run supporting local welfare programs.','2026-10-25','Melbourne','Albert Park',20.00,1,1,2),(3,'Brisbane Hope Run','A charity run raising funds for youth education programs.','2026-11-02','Brisbane','South Bank Parklands',18.00,1,1,2),(4,'Perth Family Fun Run','A family-friendly charity run supporting families in need.','2026-11-08','Perth','Kings Park',15.00,1,1,3),(5,'Adelaide Green Run','A charity run promoting environmental awareness and sustainability.','2026-11-15','Adelaide','Botanic Park',22.00,1,1,4),(6,'Gold Coast Beach Run','A coastal fun run supporting community health initiatives.','2026-11-22','Gold Coast','Surfers Paradise',25.00,1,1,3),(7,'Canberra Charity Run','A fundraising run supporting local community projects.','2026-12-01','Canberra','Commonwealth Park',20.00,1,1,1),(8,'Hobart Hope Fun Run','A charity event supporting education and family services.','2026-12-06','Hobart','Royal Tasmanian Botanical Gardens',17.00,1,1,2),(9,'Darwin Community Fun Run','A community run raising funds for local charity programs.','2026-12-12','Darwin','Bicentennial Park',15.00,1,1,3),(10,'Newcastle Charity Run','A fun run supporting community welfare and youth programs.','2026-12-18','Newcastle','Foreshore Park',18.00,1,1,1),(11,'Sydney Charity Gala','An evening fundraising gala supporting local families.','2026-10-28','Sydney','Sydney Town Hall',120.00,1,2,1),(12,'Melbourne Hope Gala','A formal charity dinner raising funds for youth education.','2026-11-05','Melbourne','Crown Conference Centre',150.00,1,2,2),(13,'Brisbane Community Gala','A community fundraising dinner supporting welfare programs.','2026-11-12','Brisbane','Brisbane Convention Centre',110.00,1,2,3),(14,'Perth Green Gala','A fundraising gala supporting environmental projects.','2026-11-18','Perth','Perth Convention Centre',130.00,1,2,4),(15,'Adelaide Charity Gala','A formal dinner raising funds for community support services.','2026-11-26','Adelaide','Adelaide Town Hall',125.00,1,2,1),(16,'Gold Coast Benefit Gala','A charity gala supporting local health and welfare initiatives.','2026-12-03','Gold Coast','Gold Coast Convention Centre',140.00,1,2,3),(17,'Canberra Hope Gala','A fundraising event supporting youth and education programs.','2026-12-10','Canberra','National Convention Centre',135.00,1,2,2),(18,'Hobart Community Gala','A charity dinner supporting local families and community groups.','2026-12-16','Hobart','Hobart Function Centre',115.00,1,2,3),(19,'Darwin Charity Gala','A formal charity evening raising funds for local programs.','2026-12-20','Darwin','Darwin Convention Centre',125.00,1,2,1),(20,'Newcastle Benefit Gala','A fundraising gala supporting community development projects.','2026-12-22','Newcastle','Newcastle City Hall',120.00,1,2,4),(21,'Sydney Charity Auction','A fundraising auction featuring donated artwork and community items.','2026-10-30','Sydney','The Rocks Community Hall',10.00,1,3,1),(22,'Melbourne Art Auction','A charity auction featuring local artwork to support youth programs.','2026-11-06','Melbourne','Federation Square',15.00,1,3,2),(23,'Brisbane Community Auction','A fundraising auction supporting local community welfare services.','2026-11-13','Brisbane','Brisbane City Hall',10.00,1,3,3),(24,'Perth Green Auction','An environmental charity auction featuring sustainable products and artwork.','2026-11-20','Perth','Perth Town Hall',12.00,1,3,4),(25,'Adelaide Benefit Auction','A charity auction raising funds for families and community support programs.','2026-11-27','Adelaide','Adelaide Convention Centre',10.00,1,3,1),(26,'Gold Coast Charity Auction','A fundraising auction supporting health and welfare initiatives.','2026-12-04','Gold Coast','Broadbeach Community Centre',15.00,1,3,3),(27,'Canberra Hope Auction','A charity auction supporting education and youth development programs.','2026-12-11','Canberra','Canberra Community Centre',10.00,1,3,2),(28,'Hobart Community Auction','A fundraising auction supporting local families and charity organisations.','2026-12-17','Hobart','Hobart Town Hall',8.00,1,3,3),(29,'Darwin Charity Auction','A community charity auction raising funds for local support programs.','2026-12-21','Darwin','Darwin Waterfront Centre',10.00,1,3,1),(30,'Newcastle Green Auction','A charity auction supporting environmental and community projects.','2026-12-23','Newcastle','Newcastle Museum Hall',12.00,1,3,4),(31,'Sydney Charity Concert','A live music event raising funds for local families in need.','2026-11-01','Sydney','Sydney Entertainment Centre',45.00,1,4,1),(32,'Melbourne Hope Concert','A charity music concert supporting youth education programs.','2026-11-09','Melbourne','Melbourne Recital Centre',50.00,1,4,2),(33,'Brisbane Community Concert','A live community concert supporting local welfare initiatives.','2026-11-16','Brisbane','Brisbane Powerhouse',40.00,1,4,3),(34,'Perth Green Concert','A charity concert promoting environmental awareness and sustainability.','2026-11-23','Perth','Perth Concert Hall',55.00,1,4,4),(35,'Adelaide Charity Concert','A fundraising music event supporting local community services.','2026-11-29','Adelaide','Adelaide Festival Centre',45.00,1,4,1),(36,'Gold Coast Benefit Concert','A live charity concert supporting community health initiatives.','2026-12-05','Gold Coast','HOTA Theatre',50.00,1,4,3),(37,'Canberra Hope Concert','A charity concert raising funds for youth and education programs.','2026-12-12','Canberra','Canberra Theatre Centre',48.00,1,4,2),(38,'Hobart Community Concert','A community music event supporting local families and charities.','2026-12-18','Hobart','Federation Concert Hall',42.00,1,4,3),(39,'Darwin Charity Concert','A fundraising concert supporting community development programs.','2026-12-24','Darwin','Darwin Entertainment Centre',45.00,1,4,1),(40,'Newcastle Green Concert','A live charity concert supporting environmental projects.','2026-12-28','Newcastle','Newcastle Civic Theatre',50.00,1,4,4);
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organisations`
--

DROP TABLE IF EXISTS `organisations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organisations` (
  `organisation_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `contact_email` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`organisation_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organisations`
--

LOCK TABLES `organisations` WRITE;
/*!40000 ALTER TABLE `organisations` DISABLE KEYS */;
INSERT INTO `organisations` VALUES (1,'Helping Hands Foundation','A non-profit organisation supporting local communities through charity events.','contact@helpinghands.org'),(2,'Bright Future Charity','A charity focused on education and youth development.','info@brightfuture.org'),(3,'Community Care Network','A community organisation supporting families and local welfare programs.','hello@communitycare.org'),(4,'Green Earth Foundation','A non-profit organisation supporting environmental and sustainability projects.','contact@greenearth.org');
/*!40000 ALTER TABLE `organisations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-05 15:38:14
