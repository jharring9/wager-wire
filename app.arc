@app
wager-wire-ae36

@aws
region us-east-1
profile default

@scheduled
line-grabber
  src scheduled/line-grabber
  cron 0 0 * * 2 *
scorer
  src scheduled/scorer
  cron 0 0 * * 2 *

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

#TODO -- remove note
note
  pk *String  # userId
  sk **String # noteId

game
  week *String
  id **String

bet
  pk *String  # userId
  sk **String # betId