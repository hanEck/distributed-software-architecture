# Activity Log

---

## Team
- Markus Fichtner
- Hannes Eckelt
- Tabea Schaeffer
- Johannes Munker
- Carolin Doht

## Actors
- Food Preparation (Markus)
- Billing (Johannes)
- Delivery (Hannes)
- Table Service (Carolin)
- Guest Experience (Tabea)

---

## Part 1: Building the system in a naive way

### Timetable

| Date       | Activity Log                     |
|------------|----------------------------------|
| 2022-10-08 | Group creation, Define contracts |
| 2022-10-11 | Defined openAPI specification    |
| 2022-10-18 | Project planning meeting         |
| 2022-10-30 | Merge meeting                    |
| 2022-11-05 | Final testing                    |

### Log
- Create Repository
- Assign actors
- Define contracts
- Defined openAPI specification
- Create APIs
- Implemented business logic
- merge all services into master
- get docker running with all services
- test communications between services
- fix existing bugs and merge
- final testing

### Food preparation

### Billing
#### Approach
1. The first thing was the definition of the item registry endpoint
2. Then I added the billing service from the node-ts template 
3. After that I added a general code structure
   - For that I added a BillingService class and defined methods without implementing them
   - Also, I added all necessary endpoints without implementation
   - The last thing I added were types for TypeScript, the contract definition as base
4. The BillingService class was the first thing I implemented
   - I implemented all defined methods and added mock data for the menu
5. Then I implemented all endpoints and added responses for each possible case 
   - After that I tested the code with requests from a Postman Runner
6. I changed the delivery endpoint to be more consistent 
   - For that I changed my code accordingly and communicated with Hannes to adjust his implementation as well
7. After we tested, I noticed that my service has a problem with multiple orders and fixed that as next step
   - For that I had to change the model and rewrite a lot of code
8. As last step I refactored my code to make it more readable

#### Problems
My service had a problem with multiple orders, as I mentioned above. I noticed in an earlier implementation that I never return a 202 status code for an updated bill, which is defined in the openAPI definition. The requirements for updating a bill were not clear for me in the beginning, until we tested. This resulted in a lot of code rewriting, model adjustments and refactoring.

### Delivery

### Table Service

### Guest Experience

### Problems
- testing fetch without docker running
- http protocol was missing in the docker-compose file

---

## Part II: Introduction of failure modes

### Timetable

| Date       | Activity Log            |
|------------|-------------------------|
| 2022-11-21 | Testing fallacies       |
| 2022-11-26 | Merge + Testing Meeting |

### Log
- Individual implementation of fallacies per service
- Create PRs for each service
- Merge PRs
- Chaos testing
- Write error documentation

### Food preparation

### Billing
#### Approach
1. Implemented a fallacy to return a 500 status code for some item deliveries
    - For that I generate a random number and check if it's under or equal to the error threshold (in our case 0.1)
    - If so, I set the status code to 500 a return an according message 
2. After we merged all our fallacies together, I created a new branch and started with the handling of the occurring errors
3. I started with a duplication check for delivered items registration
    - Delivery sends an idempotency key, which I'm retrieving and adding to an array
    - For new item registrations, I'm now checking if the ID already exists in the array
    - If so I won't process the registration and return a 400 error
4. Next I added the handling for the main fallacy for my system, which is the menu not/ slowly getting sent
    - For that I firstly added a timeout of 5 seconds to the request, so that it doesn't wait the whole time
    - Next, I extended my catch block to handle errors properly, which gets run, if the fetch times out
    - In the handling function, I have two blocks 
    - One is a normal retry with a delay, which uses a fibonacci number depending on a retry counter
    - The retry counter is 5 and gets reduced by 1 on every try
    - The second one is a circuit breaker, that runs, if the retry counter is 0
    - The breaker just waits a bit longer (2 minutes), then retries and sets the retryCounter to 5 again
    - The whole thing is recursive and repeats itself until the menu could be retrieved
5. For better debugging I also added more logs as next step
6. The last thing I added is a new error response of 404 to the customer, when he tries to get a bill before the service has the menu

#### Occurred Problems
The last thing I mentioned in the block above is an edge case, which in my opinion cannot be handled properly. If the menu cannot be retrieved from the manager and the customer wants a bill, the system will return a 404 error saying the menu and therefore the prices are not available. On the customer side only the error „No open bills“ will be shown, which does not quite meet the error message itself. I guess a solution would be an according message on customer side.

### Delivery

### Table Service

### Guest Experience

### Problems

---
