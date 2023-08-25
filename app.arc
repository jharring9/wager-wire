@app
wager-wire-ae36

@aws
region us-east-1
profile default

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

note
  pk *String  # userId
  sk **String # noteId
