import MomentumClient from '../api/momentumClient';
import Header from '../components/header';
import BindingClass from "../util/bindingClass";
import DataStore from "../util/DataStore";


const SEARCH_CRITERIA_KEY = 'search-criteria';
const SEARCH_RESULTS_KEY = 'search-results';
const EMPTY_DATASTORE_STATE = {
    [SEARCH_CRITERIA_KEY]: '',
    [SEARCH_RESULTS_KEY]: [],
};


/**
 * Logic needed for the view playlist page of the website.
 */
class GoalDetails extends BindingClass {
    constructor() {
        super();

        this.bindClassMethods(['mount', 'getGoalDetails', 'displaySearchResults', 'getHTMLForSearchResults'], this);

        // Create a enw datastore with an initial "empty" state.
        this.dataStore = new DataStore(EMPTY_DATASTORE_STATE);
        this.header = new Header(this.dataStore);
        this.dataStore.addChangeListener(this.displaySearchResults);
        console.log("goalIndex constructor");
    }

    /**
     * Add the header to the page and load the MusicPlaylistClient.
     */
    mount() {
        // Wire up the form's 'submit' event and the button's 'click' event to the search method.
        document.getElementById('goalDetails-form').addEventListener('submit', this.getGoalDetails);
        document.getElementById('goalDetails-btn').addEventListener('click', this.getGoalDetails);

        this.header.addHeaderToPage();

        this.client = new MomentumClient();
    }

    /**
     * Uses the client to perform the search, 
     * then updates the datastore with the criteria and results.
     * @param evt The "event" object representing the user-initiated event that triggered this method.
     */
    async getGoalDetails(evt) {
        // Prevent submitting the from from reloading the page.
        evt.preventDefault();

        const searchCriteria = document.getElementById('search-criteria').value;
        const previousSearchCriteria = this.dataStore.get(SEARCH_CRITERIA_KEY);

        // If the user didn't change the search criteria, do nothing
        if (previousSearchCriteria === searchCriteria) {
            return;
        }

        if (searchCriteria) {
            const results = await this.client.getGoalDetails(searchCriteria);

            this.dataStore.setState({
                [SEARCH_CRITERIA_KEY]: searchCriteria,
                [SEARCH_RESULTS_KEY]: results,
            });
        } else {
            this.dataStore.setState(EMPTY_DATASTORE_STATE);
        }
    }

    /**
     * Pulls search results from the datastore and displays them on the html page.
     */
    displaySearchResults() {
        const searchCriteria = this.dataStore.get(SEARCH_CRITERIA_KEY);
        const searchResults = this.dataStore.get(SEARCH_RESULTS_KEY);

        const searchResultsContainer = document.getElementById('search-results-container');
        const searchCriteriaDisplay = document.getElementById('search-criteria-display');
        const searchResultsDisplay = document.getElementById('search-results-display');

        if (searchCriteria === '') {
            searchResultsContainer.classList.add('hidden');
            searchCriteriaDisplay.innerHTML = '';
            searchResultsDisplay.innerHTML = '';
        } else {
            searchResultsContainer.classList.remove('hidden');
            searchCriteriaDisplay.innerHTML = `"${searchCriteria}"`;
            searchResultsDisplay.innerHTML = this.getHTMLForSearchResults(searchResults);
        }
    }

    /**
     * Create appropriate HTML for displaying searchResults on the page.
     * @param searchResults An array of playlists objects to be displayed on the page.
     * @returns A string of HTML suitable for being dropped on the page.
     */
    getHTMLForSearchResults(searchResults) {
        const goalName = searchResults.goalName;
        const goalSummaryMessage = searchResults.goalSummaryMessage;
        const statusString = searchResults.statusString;
        const sum = searchResults.status.sum;
        const statusMessage = searchResults.status.statusMessage;
        const eventSummaryList = searchResults.status.eventSummaryList;
        const eventModelList = searchResults.eventModelList;

       // Create a container element to hold additional details and the table
       const container = document.createElement('div');

       const statusEnumElement = document.createElement('h5');
       statusEnumElement.textContent = `Status: ${statusString}`;
       container.appendChild(statusEnumElement);

       const summaryMessageElement = document.createElement('p');
       summaryMessageElement.textContent = `${goalSummaryMessage}`;
       container.appendChild(summaryMessageElement);

       const sumElement = document.createElement('p');
       sumElement.textContent = `Total Sum: ${sum}`;
       container.appendChild(sumElement);
   
       const statusMessageElement = document.createElement('p');
       statusMessageElement.textContent = `${statusMessage}`;
       container.appendChild(statusMessageElement);
   
       // Create a table element
       const table = document.createElement('table');
   
       // Create the table header row
       const tableHeader = table.createTHead();
       const headerRow = tableHeader.insertRow();
       const headers = ['Date', `Daily Sum`]; // Changed the header
   
       // Populate the table header row with headers
       headers.forEach((headerText) => {
           const th = document.createElement('th');
           th.textContent = headerText;
           headerRow.appendChild(th);
       });
   
       // Create the table body
       const tableBody = table.createTBody();
   
       // Populate the table rows with event summary data
       eventSummaryList.forEach((eventSummary, index) => {
           const row = tableBody.insertRow();
           const dateCell = row.insertCell(0);
           const measurementCell = row.insertCell(1);
   
           // Extract the date and measurement from the event summary object
           const dateArray = eventSummary.date;
           const formattedDate = `${dateArray[0]}-${dateArray[1]}-${dateArray[2]}`;
   
           dateCell.textContent = formattedDate;
           measurementCell.textContent = eventSummary.summedMeasurement;
           if (eventSummary.summedMeasurement === 0) {
            // Apply the "hide-zero" class to hide cells with a measurement of 0
                measurementCell.classList.add('hide-zero');
            }
   
           // Add a CSS class to the last row to change its text color
           if (index === eventSummaryList.length - 1) {
               row.classList.add('last-row');
           }
       });
   
       // Append the table to the container
       container.appendChild(table);
   
       return container.outerHTML; // Return the container element
    }

}

/**
 * Main method to run when the page contents have loaded.
 */
const main = async () => {
    const goalDetails = new GoalDetails();
    goalDetails.mount();
};

window.addEventListener('DOMContentLoaded', main);



//   R E S P O N S E
//
// {
//     "goalDetailsModel": {
//         "status": {
//             "statusEnum": "IN_MOMENTUM",
//             "statusMessage": "You have a surplus of 90 minutes. Keep it up!",
//             "eventSummaryList": [
//                 {
//                     "date": [
//                         2023,
//                         9,
//                         9
//                     ],
//                     "summedMeasurement": 0.0
//                 },
//                 {
//                     "date": [
//                         2023,
//                         9,
//                         8
//                     ],
//                     "summedMeasurement": 140.0
//                 },
//                 {
//                     "date": [
//                         2023,
//                         9,
//                         7
//                     ],
//                     "summedMeasurement": 0.0
//                 },
//                 {
//                     "date": [
//                         2023,
//                         9,
//                         6
//                     ],
//                     "summedMeasurement": 35.0
//                 },
//                 {
//                     "date": [
//                         2023,
//                         9,
//                         5
//                     ],
//                     "summedMeasurement": 65.0
//                 },
//                 {
//                     "date": [
//                         2023,
//                         9,
//                         4
//                     ],
//                     "summedMeasurement": 0.0
//                 },
//                 {
//                     "date": [
//                         2023,
//                         9,
//                         3
//                     ],
//                     "summedMeasurement": 0.0
//                 },
//                 {
//                     "date": [
//                         2023,
//                         9,
//                         2
//                     ],
//                     "summedMeasurement": 0.0
//                 }
//             ],
//             "sum": 240.0
//         },
//         "eventModelList": [
//             {
//                 "goalId": "griffin.scott88@gmail.comRun",
//                 "eventId": "ace7dde3-6a10-4ce1-beca-e4c2fcbfa044",
//                 "dateOfEvent": [
//                     2023,
//                     9,
//                     5
//                 ],
//                 "measurement": 65.0
//             },
//             {
//                 "goalId": "griffin.scott88@gmail.comRun",
//                 "eventId": "47abf438-204c-4b7a-8be4-13f262680f3d",
//                 "dateOfEvent": [
//                     2023,
//                     9,
//                     6
//                 ],
//                 "measurement": 35.0
//             },
//             {
//                 "goalId": "griffin.scott88@gmail.comRun",
//                 "eventId": "d57af852-fdde-4931-9a7b-437c3c233ede",
//                 "dateOfEvent": [
//                     2023,
//                     9,
//                     8
//                 ],
//                 "measurement": 140.0
//             }
//         ],
//         "goalSummaryMessage": "Target: 150 minutes within a rolling 7 day period.",
//         "goalName": "Run"
//     }
// }