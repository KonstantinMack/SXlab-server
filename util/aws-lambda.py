# This function runs on AWS lambda every 3 hours to update the db with any new bets
# In order to get it running on AWS lambda you need to create a layer with the 
# necessary python module requirements like pandas etc.

import json
import requests
import pandas as pd
import time
from datetime import datetime

from sqlalchemy import create_engine

# Enter db connection string
CONNECTION_STRINGS = {
    'prod': ""
}

# Enter SX API key
HEADERS = {"X-Api-Key": ""}

engine = create_engine(CONNECTION_STRINGS['prod'], pool_pre_ping=True)

CURRENT_TIME = int(time.time())
DAYS = 14
OFFSET = 24 * 60 * 60 * DAYS

URLS = {
    "sports": "https://api.sx.bet/sports",
    "leagues": "https://api.sx.bet/leagues",
    "bets": "https://api.sx.bet/trades",
    "markets": "https://api.sx.bet/markets/find"
}

MARKET_TYPE_DICT = {
    52: 'MONEY_LINE',
    88: 'MONEY_LINE',
    226: 'MONEY_LINE',
    3: 'SPREAD',
    201: 'SPREAD',
    342: 'SPREAD',
    2: 'OVER_UNDER',
    835: 'OVER_UNDER',
    28: 'OVER_UNDER',
    29: 'OVER_UNDER',
    166: 'OVER_UNDER',
    1536: 'OVER_UNDER',
    274: 'OUTRIGHT_WINNER',
    202: 'MONEY_LINE',
    203: 'MONEY_LINE',
    204: 'MONEY_LINE',
    205: 'MONEY_LINE',
    866: 'SPREAD',
    165: 'OVER_UNDER',
    53: 'SPREAD',
    63: 'MONEY_LINE',
    77: 'OVER_UNDER'
}

QUERIES = {
    "bet_details": """
        SELECT 
          _id,
          s.label as 'sports', 
          l.label as 'league',
          m.marketHash,
          m.gameTime,
          b.betTime,
          m.teamOneName, 
          m.teamTwoName,
          CASE
            WHEN m.type IN ('52', '63', '88', '202', '203', '204', '205', '226', '274') THEN 'MONEY_LINE'
            WHEN m.type IN ('2', '28', '29', '77', '165', '166', '835', '1536') THEN 'OVER_UNDER'
            WHEN m.type IN ('3', '53', '201', '342', '866') THEN 'SPREAD'
            ELSE m.type
          END as 'type',
            m.outcome,
            b.bettor,
            b.maker as isMaker,
            b.bettingOutcomeOne,
            1 / (b.odds / POWER(10, 20)) as decimalOdds,
            t.token, 
            COALESCE(cp.price, 1) as price,
            b.stake / POWER(10, t.decimals) as unitStake,
            b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) as dollarStake,
          CASE
            WHEN m.outcome = 0 THEN 0
            WHEN m.outcome = 1 AND b.bettingOutcomeOne = 1 THEN b.stake / POWER(10, t.decimals) * ((1 / (b.odds / POWER(10, 20)) - 1) * IF(b.maker, 0.98, 0.96))
            WHEN m.outcome = 2 AND b.bettingOutcomeOne = 0 THEN b.stake / POWER(10, t.decimals) * ((1 / (b.odds / POWER(10, 20)) - 1) * IF(b.maker, 0.98, 0.96))
            ELSE -b.stake / POWER(10, t.decimals)
          END as unitProfitLoss,
          CASE
            WHEN m.outcome = 0 THEN 0
            WHEN m.outcome = 1 AND b.bettingOutcomeOne = 1 THEN b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) * ((1 / (b.odds / POWER(10, 20)) - 1) * IF(b.maker, 0.98, 0.96))
            WHEN m.outcome = 2 AND b.bettingOutcomeOne = 0 THEN b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) * ((1 / (b.odds / POWER(10, 20)) - 1) * IF(b.maker, 0.98, 0.96))
            ELSE -b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1)
          END as dollarProfitLoss,
          CASE
            WHEN m.outcome = 1 AND b.bettingOutcomeOne = 1 THEN b.stake / POWER(10, t.decimals) * ((1 / (b.odds / POWER(10, 20)) - 1) * IF(b.maker, 0.02, 0.04))
            WHEN m.outcome = 2 AND b.bettingOutcomeOne = 0 THEN b.stake / POWER(10, t.decimals) * ((1 / (b.odds / POWER(10, 20)) - 1) * IF(b.maker, 0.02, 0.04))
            ELSE 0
          END as unitFees,
          CASE
            WHEN m.outcome = 1 AND b.bettingOutcomeOne = 1 THEN b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) * ((1 / (b.odds / POWER(10, 20)) - 1) * IF(b.maker, 0.02, 0.04))
            WHEN m.outcome = 2 AND b.bettingOutcomeOne = 0 THEN b.stake / POWER(10, t.decimals) * COALESCE(cp.price, 1) * ((1 / (b.odds / POWER(10, 20)) - 1) * IF(b.maker, 0.02, 0.04))
            ELSE 0
          END as dollarFees,
          b.date as betDate
        FROM bets b
        JOIN markets m ON b.marketHash = m.marketHash
        JOIN leagues l ON m.leagueId = l.leagueId
        JOIN sports s ON m.sportId = s.sportID
        JOIN tokens t ON b.baseToken = t.baseToken
        LEFT JOIN crypto_prices cp ON b.date = cp.date AND b.baseToken = cp.baseToken
        WHERE b._id NOT IN (SELECT _id FROM bet_details)
    """,
    "stats_overall": """
        SELECT
            token,
            sports,
            league,
            type,
            COUNT(*) as numberOfBets,
            AVG(dollarStake) as avgDollarBetSize,
            SUM(dollarStake) as totalDollarMatched,
            SUM(dollarFees) as totalDollarFees,
            SUM(unitFees) as totalUnitFees
        FROM bet_details
        GROUP BY token, sports, league, type
    """,
    "stats_by_sports": """
        SELECT 
            'All' as sports, 
            COUNT(DISTINCT bettor) as numUniqAddresses,
            COUNT(DISTINCT marketHash) as numMarkets
        FROM bet_details

        UNION ALL

        SELECT 
            sports, 
            COUNT(DISTINCT bettor) as numUniqAddresses,
            COUNT(DISTINCT marketHash) as numMarkets
        FROM bet_details
        GROUP BY sports
    """,
    "stats_by_markets": """
        SELECT
            sports,
            league,
            teamOneName, 
            teamTwoName, 
            gameTime,
            COUNT(*) as numberOfBets,
            SUM(dollarStake) as totalVolumeMatched,
            SUM(dollarFees) as totalDollarFees
        FROM bet_details
        GROUP BY sports, league, teamOneName, teamTwoName, gameTime
        ORDER BY totalVolumeMatched DESC
    """,
    "stats_time_series": """
        SELECT 
            YEAR(betDate) as year, 
            MONTH(betDate) as month,
            'All' as sports,
            token,
            COUNT(DISTINCT(bettor)) AS numberOfAddresses,
            COUNT(*) as numberOfBets, 
            SUM(dollarStake) as totalDollarMatched, 
            AVG(dollarStake) as avgDollarBetSize,
            SUM(dollarFees) as totalDollarFees,
            SUM(unitFees) as totalUnitFees
        FROM bet_details
        GROUP BY YEAR(betDate), MONTH(betDate), token

        UNION ALL

        SELECT 
            YEAR(betDate) as year, 
            MONTH(betDate) as month,
            sports,
            token,
            COUNT(DISTINCT(bettor)) AS numberOfAddresses,
            COUNT(*) as numberOfBets, 
            SUM(dollarStake) as totalDollarMatched, 
            AVG(dollarStake) as avgDollarBetSize,
            SUM(dollarFees) as totalDollarFees,
            SUM(unitFees) as totalUnitFees
        FROM bet_details
        GROUP BY YEAR(betDate), MONTH(betDate), sports, token
    """,
    "stats_tipsters": """
        SELECT 
            bettor, 
            COUNT(*) as numBets, 
            ROUND(SUM(dollarStake)) as dollarStake, 
            ROUND(SUM(dollarProfitLoss)) as dollarProfitLoss, 
            ROUND(SUM(dollarProfitLoss) * 100 / SUM(dollarStake), 2) as yield,
            ROUND(SUM(IF(dollarProfitLoss > 0, 1, 0)) / SUM(IF(dollarProfitLoss != 0, 1, 0)) * 100) as winningPerc,
            ROUND(AVG(isMaker), 2) as isMaker, 
            ROUND(AVG(decimalOdds), 2) as avgOdds
        FROM bet_details
        GROUP BY bettor
        HAVING numBets > 100
        ORDER BY SUM(dollarProfitLoss) DESC
    """
}

def get_date(stamp):
    return datetime.fromtimestamp(stamp).strftime("%Y/%m/%d")

def fetch_existing_values(table, column, values):
    query = f"""SELECT {column} FROM {table} WHERE {column} IN ({", ".join([f"'{x}'" for x in values])})"""
    existing = pd.read_sql(query, con=engine)
    return set(existing[column])

def create_query_string(query_params):
    params = "&".join([f"{k}={v}" for k, v in query_params.items()])
    return f"?{params}"

### Crypto prices

CRYPTO_VARS = {
    "SX": {
        "URL": f"https://api.coingecko.com/api/v3/coins/sx-network/market_chart?vs_currency=USD&days={DAYS}&interval=daily",
        "baseToken": "0xaa99bE3356a11eE92c3f099BD7a038399633566f"
    },
    "ETH": {
        "URL": f"https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=USD&days={DAYS}&interval=daily",
        "baseToken": "0xA173954Cc4b1810C0dBdb007522ADbC182DaB380"
    }
}

def update_crypto_prices_table():

    new_prices = []

    for crypto, details in CRYPTO_VARS.items():
        data = requests.get(details['URL'])
        prices = pd.DataFrame(data.json()['prices']).rename(columns={0: 'timestamp', 1: "price"})
        prices.timestamp /= 1000
        prices['date'] = prices['timestamp'].apply(get_date)
        prices['crypto'] = crypto
        prices['baseToken'] = details['baseToken']
        prices.drop_duplicates(subset=['date'], inplace=True)

        prices_query = f"SELECT date FROM crypto_prices WHERE crypto = '{crypto}'"
        existing_prices = pd.read_sql(prices_query, con=engine)
        set_existing_prices = set(existing_prices.date)

        prices = prices[~prices.date.isin(set_existing_prices)].copy()
        new_prices.append(prices)


    crypto_prices = pd.concat(new_prices)
    token_cols = ["baseToken", "crypto", "price", "date"]

    if not crypto_prices.empty:
        crypto_prices[token_cols].to_sql("crypto_prices", con=engine, if_exists="append", index=False)
        print(f"Added {crypto_prices.shape[0]} crypto prices")
        
    else:
        print(f"No new crypto prices to add")
    

### Sports

def update_sports_table():
    sports = requests.get(URLS["sports"], headers=HEADERS).json()['data']
    exisiting_ids = fetch_existing_values("sports", "sportId", [x['sportId'] for x in sports])
    sports = [x for x in sports if x['sportId'] not in exisiting_ids]
    
    if sports:
        pd.DataFrame(sports).to_sql("sports", con=engine, if_exists="append", index=False)
        print(f"{len(sports)} new sports added")
    else:
        print("No new sports to add")

### Leagues

def update_leagues_table():
    leagues = requests.get(URLS["leagues"], headers=HEADERS).json()['data']
    exisiting_ids = fetch_existing_values("leagues", "leagueId", [x['leagueId'] for x in leagues])
    leagues = [x for x in leagues if x['leagueId'] not in exisiting_ids]
    
    if leagues:
        pd.DataFrame(leagues).to_sql("leagues", con=engine, if_exists="append", index=False)
        print(f"{len(leagues)} new leagues added")
    else:
        print("No new leagues to add")

### Bets

def update_bets_table():
    query_params = {
        "pageSize": 300,
        "settled": "true",
        "startDate": CURRENT_TIME - OFFSET,
        }
    
    all_bets = []
    data = requests.get(f"{URLS['bets']}{create_query_string(query_params)}", headers=HEADERS).json()['data']
    all_bets.append(data['trades'])
    
    while data['trades']:
        query_params["paginationKey"] = data['nextKey']
        data = requests.get(f"{URLS['bets']}{create_query_string(query_params)}", headers=HEADERS).json()['data']
        all_bets.append(data['trades'])
        
    bets_list = [item for sublist in all_bets for item in sublist]
    
    existing_ids = fetch_existing_values('bets', "_id", [x['_id'] for x in bets_list])
    
    new_bets = [x for x in bets_list if x['_id'] not in existing_ids]
    
    new_bets_df = pd.DataFrame(new_bets)
     
    if not new_bets_df.empty:
        new_bets_df.drop_duplicates(subset=['_id'])
        new_bets_df["date"] = new_bets_df.betTime.apply(get_date)
        bets_cols = "_id baseToken bettor stake odds orderHash marketHash maker betTime settled settleValue bettingOutcomeOne fillHash tradeStatus valid outcome settleDate date".split()
        new_bets_df[bets_cols].to_sql("bets", con=engine, if_exists="append", index=False)
        
        print(f"Added {new_bets_df.shape[0]} bets")
        
    else:
        print("No new bets to add")
        
    return new_bets

### Markets

def update_markets_table(new_bets):
    existing_ids = fetch_existing_values("markets", "marketHash", [x['marketHash'] for x in new_bets])
    new_markets = list(set([x['marketHash'] for x in new_bets if x['marketHash'] not in existing_ids]))
    
    market_info = []
    failed_markets = []
    chunk_length = 30

    chunks = (len(new_markets) - 1) // chunk_length + 1
    for i in range(chunks):
        market_hashes_string = ",".join(new_markets[i*chunk_length:(i+1)*chunk_length])
        try:
            data = requests.get(f"{URLS['markets']}?marketHashes={market_hashes_string}", headers=HEADERS).json()['data']
            market_info.append(data)

        except:
            failed_markets.append(new_markets[i*chunk_length:(i+1)*chunk_length])
    
    market_info_flat = [item for sublist in market_info for item in sublist]
    
    market_df = pd.DataFrame(market_info_flat)

    if not market_df.empty:
        market_df['type'] = market_df['type'].replace(MARKET_TYPE_DICT)
        market_cols = pd.read_sql("SELECT * FROM markets LIMIT 1", con=engine).columns[:-1]
        market_cols = list(set(market_cols).intersection(set(market_df.columns)))
        market_df[market_cols].to_sql("markets", con=engine, if_exists="append", index=False)
        print(f"Added {market_df.shape[0]} markets")
        if failed_markets:
            print("There were errors fetching markets")

    else:
        print("No markets to add")
        if failed_markets:
            print("There were errors fetching markets")
            

def update_basic_tables():
    update_crypto_prices_table()
    update_sports_table()
    update_leagues_table()
    new_bets = update_bets_table()
    if new_bets:
        update_markets_table(new_bets)

def update_derived_tables():
    bet_details = pd.read_sql(QUERIES['bet_details'], con=engine)
    new_bets = bet_details.to_sql("bet_details", con=engine, if_exists="append", index=False)
    print(f"Added {new_bets} bets with details")
    
    if new_bets:
        for stat_table in ["stats_overall", "stats_by_sports", "stats_by_markets", "stats_time_series", "stats_tipsters"]:
            stats = pd.read_sql(QUERIES[stat_table], con=engine)
            with engine.connect() as connection:
                connection.execute(f"TRUNCATE {stat_table}")
            new_stats_rows = stats.to_sql(stat_table, con=engine, if_exists="append",  index=False)
            print(f"Added {new_stats_rows} rows to {stat_table}")
            
def update_time_table():
    with engine.connect() as connection:
        connection.execute(f"INSERT INTO `update_time` (updatedAt) VALUES ({int(time.time())});")
        
def run_table_updates():
    update_basic_tables()
    update_derived_tables()
    update_time_table()
    print(f"All tables updated at {pd.Timestamp.now()}")


def lambda_handler(event, context):
    run_table_updates()
    return {
        'statusCode': 200,
        'body': json.dumps('Update successful')
    }
