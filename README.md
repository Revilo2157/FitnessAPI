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
      
### Stats:
Returns the user's information file. Throws an exception if the user does not exist in the server.  
**Inputs:**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Username:* The user whose data is to be returned.           

      http://152.3.69.115:8081/api/stats/username  
      
### Update:
Updates the user's information to include newly done workouts. Throws an exception if the user does not exist in the server.  
**Inputs:**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Username:* The user to update.        
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Workout:* Which workout to update.   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Amount:* How many reps of the above workout.   

      http://152.3.69.115:8081/api/update/username/workout/amount 
      
### Delete:
Deletes the information of the user specified in the username field.  
**Inputs:**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Username:* The user whose data is to be deleted. 

      http://152.3.69.115:8081/api/delete/username      
      
### Leaderboard:
Returns the leaderboard.

      http://152.3.69.115:8081/api/leaderboard  
      
### Reset:
Resets the leaderboard. This does not affect any user information. This is used to test the other methods.

      http://152.3.69.115:8081/api/reset  
   
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
         amount: Int,
         you: Int,
         them: Int,
         completed: Bool,
         first: String
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
