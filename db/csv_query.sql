-- for inputting historical btc price:

LOAD DATA LOCAL INFILE  
'/Users/CeciliaWang/Downloads/btc_usd.csv'
INTO TABLE btc_price  
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(date, @var1, @var2, @var3, @var4, percent_change)
SET price = REPLACE(@var1,',', ''), open = REPLACE(@var2,',', ''), high = REPLACE(@var3,',', ''), low = REPLACE(@var4,',', '')

-- for inputting user's historical transactions:

LOAD DATA LOCAL INFILE  
'/Users/CeciliaWang/Downloads/btc_usd.csv' -- update file path
INTO TABLE transactionsAvg -- replicate for FIFO and LIFO  
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
-- put @dummy anwhere there's a column in the CSV you want to ignore:
(user_id, coin, date, @var1, @var2, units, total_cost)
SET cost = REPLACE(@var1,',', ''), price = REPLACE(@var2,',', '')
