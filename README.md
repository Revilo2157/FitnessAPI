# Duke Fitness App API
Server-side API to establish a leaderboard and send challenges to other users.

Deployed at: 
http://152.3.69.115:8081/

## Usage: 
### Ping:
Used to test if the API is online.  
      
      http://152.3.69.115:8081/api/ping  
      
### New:
Creates a new user file on the server. Throws an exception if the user already exists.  
**Inputs:**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Username:* The username to create the file for.
   
      http://152.3.69.115:8081/api/new/username   
      
### Challenge:
Creates a challenge between two different users. Throws an exception if either user does not exist in the server.  
**Inputs:**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Challenger:* The user that initiated the challenge.      
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Challenged:* The user that was challenged. 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Workout:* Which workout is to be done. 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Amount:* How many reps of the above workout. 
      
      http://152.3.69.115:8081/api/challenge/challenger/challenged/workout/amount  
      
### Challenge:
Creates a challenge between two different users. Throws an exception if either user does not exist in the server.  
**Inputs:**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Challenger:* The user that initiated the challenge.      
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Challenged:* The user that was challenged. 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Workout:* Which workout is to be done. 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Amount:* How many reps of the above workout. 

      http://152.3.69.115:8081/api/stats/username  
      
      ### Challenge:
Creates a challenge between two different users. Throws an exception if either user does not exist in the server.  
**Inputs:**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Challenger:* The user that initiated the challenge.      
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Challenged:* The user that was challenged. 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Workout:* Which workout is to be done. 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Amount:* How many reps of the above workout. 

      http://152.3.69.115:8081/api/update/username/workout/amount 
      
      ### Challenge:
Creates a challenge between two different users. Throws an exception if either user does not exist in the server.  
**Inputs:**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Challenger:* The user that initiated the challenge.      
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Challenged:* The user that was challenged. 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Workout:* Which workout is to be done. 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Amount:* How many reps of the above workout. 

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
