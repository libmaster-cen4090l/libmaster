# LibMaster

### Overview
We want to revamp the FSU library study room reservation system to be more accessible, easier to use, and more visually appealing. We want to make it easier to visualize which rooms are available and which are not. We want to add better querying capabilities and allow users to sort the available rooms by library, floor, size, and time available. We would like to add a visualization of which rooms are available in a floor-map format.

### Motivation
We want to develop this software because the current library system is tedious to use and does not display the room data in a user-friendly manner. We believe that we can create a functional, improved room reservation system.

### Features and Types of Users
Users: undergrad/grad students, library admin

Undergrad and grad students will have the ability to:
Log into their FSU account, search for a study room/study supplies, filter their search (based on library, floor, capacity, window of availability), select a study room/supply for a specific window of time, enter their information for booking entry, then submit their booking. Students will be able to view their current bookings, as well as view a map of available and unavailable study rooms. Students can log out of their accounts when they are finished. 
will have the ability to:
Log into their admin accounts, mark rooms/supplies as available/unavailable. Admin can also add/remove items from the library supply inventory.

### Risk / Challenges
In the event there are complications surrounding the authentication of users within the university's web server, we would be unable to synchronize the application with the library’s actual room data. Additionally, we must identify avenues to obtain user metrics from fsu.libcal.com in a non-intrusive manner. Also, we will have to deal with the scenario where two users try to reserve the same room at the same time, as well as prevent double bookings in the case that admin marks a room as available.

### Existing Related Projects
The current FSU Library study room reservation app. Ticket Master as an example visualization of a booking/reservation system that has a similar map implementation to what we plan to create. Currently, users must navigate through several pages in order to monitor the state of a room. Streamline the user interface, so that the process of reserving a room requires no more user interaction than absolutely necessary. Additionally, user metadata such as name and the last 4 digits of their library card number might be stored locally, so that reservations can be completed as seamlessly as possible.

### Intended Platform / Programming Language
For frontend, we are considering React / React Native. For the database, we are considering PostgreSQL. For the backend, we are considering Django. Ideally, our implementation would come in the form of a multi-platform web-application, which could be used on Windows, Mac, Linux, iOS, and Android.

### Third-party libraries / APIs to be used
None at the moment

## Environment Setup
For local development:
1. Copy `.env.template` to `.env` in the backend directory
2. Fill in your local configuration values (may be whatever you prefer)
3. Never commit the actual `.env` file, ensure it is gitignored!
