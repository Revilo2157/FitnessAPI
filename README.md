# Duke Fitness App API
Server-side API to establish a leaderboard and send challenges to other users.

Deployed at: 
http://152.3.69.115:8081/

## Usage: 
### Ping:
#### Call:
http://152.3.69.115:8081/api/ping  
Used to test if the API is online

http://152.3.69.115:8081/api/new/username   
http://152.3.69.115:8081/api/challenge/challenger/challenged/workout/amount  
http://152.3.69.115:8081/api/stats/username  
http://152.3.69.115:8081/api/update/username/workout/amount  
http://152.3.69.115:8081/api/leaderboard  
   
## Return Values:
Most messages will be responded to with a message stating if they were successful or not. The exceptions to this are errors where an empty message is sent as well as information replies. There the JSON will follow this structure:
### Stats:
```javascript
{  
   Stats: [{  
         workout: String,  
         amount: Int  
      },  
   ] 
   
   Challenges: [{  
         opponent: String,  
         workout: String,  
         amount: Int  
      },  
   ]  
}
```

### Leaderboards
```javascript
{
   General: [{
         workout: String, 
         username : String, 
         amount : Int
      },
   ],

   Workouts: [{
         workout: String, 
         data: [{
               username: String, 
               amount: Int
            },
         ]
      },
   ]
}
```
