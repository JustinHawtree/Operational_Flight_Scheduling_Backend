import * as AircraftService from "../services/aircraftService";
import Aircraft from "../models/aircraftInterface";
import * as AircraftModelService from "../services/aircraftModelService";
import AircraftModel from "../models/aircraftModelInterface";
import * as CrewPositionService from "../services/crewPositionService";
import CrewPosition from "../models/crewPositionInterface";
import * as LocationService from "../services/locationService";
import Location from "../models/locationInterface";

const POPULATION_SIZE: number = 200;

//const schedule_start: Date = new Date(2020, 10, 16);
//const schedule_end: Date = new Date(2020, 10, 20, 20);

function sample(array: Array<any>): any {
  return array[~~(Math.random() * array.length)]
}

function random_date_in_range(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getMinutesBetweenDates(startDate: Date, endDate: Date) {
  var diff = endDate.getTime() - startDate.getTime();
  return (diff / 60000);
}

function zip(a: Array<any>, b: Array<any>): Array<any> {
  return a.map((k, i) => [k, b[i]]);
}


class Schedule {
  gnome: any;
  fitness: number;
  static schedule_start: Date;
  static schedule_end: Date;
  static duration: number;
  static num_flights: number;
  static avaliable_genes: Array<Array<any>>;

  constructor(gnome: any) {
    if (gnome === null) {
      this.gnome = Schedule.create_gnome();
    } else {
      this.gnome = gnome;
    }
    this.fitness = this.calculate_fitness();
  }

  static mutated_genes(list: Array<any>): any {
    return sample(list);
  }

  static create_flight_chromosome(): Array<any> {
    let flight_chromosome: Array<any> = [];
    for (let i = 0; i < Schedule.avaliable_genes.length; i++) {
      if (i === 0) {
        flight_chromosome.push(random_date_in_range(Schedule.schedule_start, Schedule.schedule_end));
      } else if (i === 1) {
        let hours: number = this.duration;
        let end_flight_time: Date = new Date(flight_chromosome[0].valueOf());
        end_flight_time.setHours(end_flight_time.getHours() + hours);
        flight_chromosome.push(end_flight_time);
      } else {
        flight_chromosome.push(this.mutated_genes(Schedule.avaliable_genes[i]));
      }
    }
    return flight_chromosome;
  }

  static create_gnome(): Array<Array<any>> {
    let schedule_gnome: Array<any> = [];
    for (let i = 0; i < Schedule.num_flights; i++) {
      schedule_gnome.push(this.create_flight_chromosome());
    }
    return schedule_gnome;
  }

  mate(partner: Schedule): Schedule {
    let child_gnome: Array<any> = [];

    zip(this.gnome, partner.gnome).forEach(([p1_chromosome, p2_chromosome], i) => {
      let prob: number = Math.random();

      if (prob < 0.45) {
        child_gnome.push(p1_chromosome);
      } else if (prob < 0.90) {
        child_gnome.push(p2_chromosome);
      } else {
        child_gnome.push(Schedule.create_flight_chromosome());
      }
    });
    return new Schedule(child_gnome);
  }

  calculate_fitness(): number {
    let fitness: number = 0;
    let close_ness_fitness: number = 0;
    let chromosome_times: Array<Array<Date>> = [];
    let aircraft_used: any = {};
    let days_used: { [key: string]: number; } = {};

    this.gnome.forEach((chromosome: any, i: number) => {
      let start1: Date = chromosome[0];
      if (days_used[start1.getDate()]) {
        days_used[start1.getDate()] += 1
      } else {
        days_used[start1.getDate()] = 1;
      }
      let end1 = chromosome[1];
      let aircraft = chromosome[2];

      chromosome_times.forEach(([start2, end2], i) => {
        if (Math.max(start1.getTime(), start2.getTime()) < Math.min(end1.getTime(), end2.getTime())) {
          fitness += 10;
        }
      });

      if (i > 1) {
        let diff_minutes: number = getMinutesBetweenDates(chromosome[0], this.gnome[i-1][1]);
        for (i = 1; i < 16; i++) {
          if (diff_minutes > (i*20)) {
            close_ness_fitness += 2;
          }
        }
      }
      chromosome_times.push([start1, end1]);
    });
    for (const day_count of Object.values(days_used)) {
      close_ness_fitness += 5*Math.abs(5-day_count);
    }
    if (fitness > 0) {
      fitness += close_ness_fitness;
    }
    return fitness
  }

  printChromosome(): string {
    let gnome_string: string = "";
    this.gnome.forEach((chromosome: any) => {
      let chromosome_string: string = "";
      chromosome.forEach((gene: any) => {
        chromosome_string += gene+" ";
      })
      gnome_string += chromosome_string+"\n";
    });
    return gnome_string;
  }
}

// Array.from({length:11}, (_,i) => i + 1)
async function generate_schedule(config: any): Promise<any> {
  //console.log("Start config", config.start);
  Schedule.schedule_start = new Date(config.start);
  //console.log("Final Start", Schedule.schedule_start);
  Schedule.schedule_end = new Date(config.end);
  Schedule.duration =  Number(config.duration);
  Schedule.num_flights = Number(config.num_flights);
  const aircraft_model_whitelist = config.whitelist_models;

  const aircrafts: Array<Aircraft> = await AircraftService.getAllAvaliableAircrafts();
  const locations: Array<Location> = await LocationService.getAllLocations();
  const aircraft_models: Array<AircraftModel> = await AircraftModelService.getAllAircraftModels();
  const crew_positions: Array<CrewPosition> = await CrewPositionService.getAllCrewPositions();
  const colors: Array<string> = ["#9C27B0", "#3F51B5", "#3174ad", "#4CAF50", "#FFC107", "#FF5722", "#D50000"];
  const names: Array<string> = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", 
    "Juliett", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa", "Quebec", "Romeo", "Sierra", "Tango", "Uniform",
    "Victor", "Whiskey", "X-ray", "Yankee", "Zulu"];

  let aircraft_list: any = Array.from(aircrafts.filter((model) => aircraft_model_whitelist.includes(model.model_uuid)));


  let avaliable_genes: Array<Array<any>> = [
    [],
    [],
    Array.from(aircraft_list),
    Array.from(locations),
    Array.from(colors),
    Array.from(names),
  ];
  Schedule.avaliable_genes = Array.from(avaliable_genes);



  let generation: number = 1;

  let found: boolean = false;
  let population: Array<Schedule> = [];

  for (let i = 0; i < POPULATION_SIZE; i++) {
    population.push(new Schedule(null));
  }


  while (!found) {
    population.sort((a, b) => a.fitness - b.fitness);
    let peak: number = population[0].fitness;
    let peak_count: number = 0;

    population.forEach((item) => {
      if(item.fitness === peak) peak_count += 1;
    });
    let sorted_apex: any = population[0];
    sorted_apex.gnome.sort((a:any, b:any) => ((a[0] < b[0]) ? -1 : ((a[0] > b[0]) ? 1 : 0)));
    //console.log("Generation", generation, " Fitness", population[0].fitness,"\n\n", sorted_apex.printChromosome());


    if (population[0].fitness <= 0) {
      found = true;
      return {schedule: population[0], generation: generation};
      break;
    }
    // kill if contraints too tight Generation 8000
    if (generation >= 8000) {
      found = false;
      return {error: "Constraint too tight (beyond 8000) ending infinite loop"};
      break;
    }

    let new_generation: Array<Schedule> = [];

    let s = Math.round((15*POPULATION_SIZE)/100)
    new_generation = Array.from(population.slice(0, s));


    s = Math.round((15*POPULATION_SIZE)/100);
    for (let i = 0; i < s; i++) {
      let parent1: Schedule = sample(population.slice(0, Math.round((1*POPULATION_SIZE)/100)));
      let parent2: Schedule = sample(population.slice(0, Math.round((1*POPULATION_SIZE)/100)));
      let child: Schedule = parent1.mate(parent2);
      new_generation.push(child);
    }


    s = Math.round((70*POPULATION_SIZE)/100);
    for (let i = 0; i < s; i++) {
      let parent1: Schedule = sample(population.slice(0, Math.round(POPULATION_SIZE/2)));
      let parent2: Schedule = sample(population.slice(0, Math.round(POPULATION_SIZE/2)));
      let child: Schedule = parent1.mate(parent2);
      new_generation.push(child);
    }

    population = Array.from(new_generation);
    generation += 1;
  }
}

async function generate_runner(config: any): Promise<any> {
  if (config === null) {
    config = {
      whitelist_models: ['1b365e0c-ee69-4bf6-bc69-92868f2a7ff3',
                         '2c04be67-fc24-4eba-b6ca-57c81daab9c4',
                         'b0f4cd21-9e4c-4b4d-b4ae-88668b492a7b'],
      start: "2020-11-29T01:30:00.000Z",
      end: '2020-12-05T20:30:00.000Z',
      duration: 4,
      num_flights: 26
    };
  }
  let new_schedule = await generate_schedule(config);
  if (new_schedule.error) {
    console.log("GENERATION ERROR: TOOK TOO LONG TO GENERATE SCHEDULE");
    return [];
  }
  //console.log("Tester!");
  //console.log("Done! Generation", new_schedule.generation, " Fitness", new_schedule.schedule.fitness, new_schedule.schedule.printChromosome());
  let flights: Array<any> = [];
  let mock_uuid: number = 123;
  new_schedule.schedule.gnome.forEach((chromosome: any) => {
    flights.push({
      flight_uuid: mock_uuid,
      location_uuid: chromosome[3].location_uuid,
      aircraft_uuid: chromosome[2].aircraft_uuid,
      start: chromosome[0],
      end: chromosome[1],
      color: chromosome[4],
      title: chromosome[5],
      description: "",
      allDay: false,
      crew_members: []
    })
    mock_uuid += 1;
  });
  return flights;
}
generate_runner(null);
export default generate_runner;
