## Running

* `npm i`
* `npm start`
* Navigate to http://localhost:PORT/graphiql for a graphql interface that lets you play around. Or GET http://localhost:PORT/graphql?query=QUERY

## Sample  queries

### Get todays NBA scores

```graphql
{
  nbaToday {
    city
    homeTeam
    homeScore
  }
}
```
**returns:**
```json
{
   "data": {
    "nbaToday": {
      "city": "Boston",
      "homeTeam": "BOS",
      "homeScore": 123
    }
  }
}
```
