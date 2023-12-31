@app
wager-wire-ae36

@create
autocreate true

@aws
region us-east-1
profile default

@scheduled
line-grabber
  src scheduled/line-grabber
  cron 0 12 ? * TUE *
score-grabber
  src scheduled/score-grabber
  cron 0 8 ? * FRI-TUE *
scorer
  src scheduled/scorer
  cron 0 12 ? * TUE *

@http
/*
  method any
  src server

@static

@tables
user
  pk *String

password
  pk *String # userId

game
  week *String
  id **String

bet
  pk *String  # userId
  sk **String # betId

@tables-indexes
bet
  sk *String
  projection all
  name byWeek

user
  rankingType *String
  totalProfit **Number
  projection name email
  name byTotalProfit
