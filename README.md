# Duke Fitness App
Server-side API to establish a leaderboard and send challenges to other users.

Deployed at: 
https://http://152.3.69.115:8081/

## Usage: 
http://152.3.69.115:8081/api/ping  
http://152.3.69.115:8081/api/new/username   
http://152.3.69.115:8081/api/challenge/challenger/challenged/workout/amount  
http://152.3.69.115:8081/api/stats/username  
http://152.3.69.115:8081/api/update/username/workout/amount  
http://152.3.69.115:8081/api/leaderboard  
   
## Return Values:
Most messages will be responded to with a message stating if they were successful or not. The exceptions to this are errors where an empty message is sent as well as information replies. There the JSON will follow this structure:
### Stats:
   {  
      Stats: [{  
            workout: String,  
            amount: int  
         },  
      ]  
      Challenges: [{  
            opponent: String,  
            workout: String,  
            amount: int  
         },  
      ]  
   }
   
   
## [DukeFitnessApp](https://github.com/Revilo2157/dukefitnessapp/)

