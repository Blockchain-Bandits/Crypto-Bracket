CREATE DATABASE project_two;

USE project_two;

CREATE TABLE transactions (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT(11) NOT NULL,
  coin VARCHAR(4) NOT NULL,
  date VARCHAR(20) NOT NULL,
  cost DECIMAL(11,2) NOT NULL,
  price DECIMAL(11,2) NOT NULL,
  units DECIMAL(11,2) NOT NULL,
  total_cost DECIMAL(11,2) NOT NULL,
  PRIMARY KEY (id)
);