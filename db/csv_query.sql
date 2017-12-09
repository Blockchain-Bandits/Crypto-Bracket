-- for inputting historical btc price:

LOAD DATA LOCAL INFILE  
'/Users/CeciliaWang/Downloads/btc_usd.csv'
INTO TABLE btcPrices  
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(date, @var1, @var2, @var3, @var4, percent_change)
SET price = REPLACE(@var1,',', ''), open = REPLACE(@var2,',', ''), high = REPLACE(@var3,',', ''), low = REPLACE(@var4,',', '')
