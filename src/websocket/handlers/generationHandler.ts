
const aircraftHandler = async (action: string, payload: { [key: string]: string }, callback: (error: any, response: any) => any) => {
  switch (action) {

    case "generate":
      console.log("Websocket Generation generate case!");
      console.log("Generate Handler Got Message:", payload);
      console.log("Start:", new Date(payload.start));
      console.log("End:", new Date(payload.end));
      try {
        callback(false, 
          { 
            flights: [
              {
                flight_uuid: 'c7a70c63-d2b1-44ec-9d03-df77f8f81de0',
                location_uuid: '96017add-cf3d-4075-b09b-7fd9ad690e04',
                aircraft_uuid: '63c6821a-fb98-418b-9336-c60beb837708',
                start: '2020-11-29T12:30:00.000Z',
                end: '2020-11-29T16:30:00.000Z',
                color: "#D50000",
                title: "Sample Title 1",
                description: "Sample Description 1",
                allDay: false,
                crew_members: []
              },
              {
                flight_uuid: '4f1724ac-6a4a-4276-9fe5-9a8ca1f5b68c',
                location_uuid: '96017add-cf3d-4075-b09b-7fd9ad690e04',
                aircraft_uuid: '5a3db7a6-ffea-427d-8093-4c2d26392fb8',
                start: '2020-12-01T16:30:00.000Z',
                end: '2020-12-01T20:30:00.000Z',
                color: "#FF5722",
                title: "Sample Title 2",
                description: "Sample Description 2",
                allDay: false,
                crew_members: []
              },
              {
                flight_uuid: 'bf7e5f19-79da-495a-a0b0-195fb5465cc1',
                location_uuid: 'ea703189-31ea-4235-bdbb-b017731fb29c',
                aircraft_uuid: '5a3db7a6-ffea-427d-8093-4c2d26392fb8',
                start: '2020-12-02T08:00:00.000Z',
                end: '2020-12-02T12:00:00.000Z',
                color: "#4CAF50",
                title: "Sample Title 3",
                description: "Sample Description 3",
                allDay: false,
                crew_members: []
              },
            ] 
          });

      } catch (error) {
        console.error("Websocket Generation generate error:", error);
        callback("Websocket Generation generate error: " + error, null);
      }
      break;
 
    default:
      callback("Websocket Aircraft: No valid action provided", null);
      break;
  }
}

export default aircraftHandler;