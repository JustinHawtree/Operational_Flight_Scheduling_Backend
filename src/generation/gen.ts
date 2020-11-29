import * as AircraftService from "../services/aircraftService";
import Aircraft from "../models/aircraftInterface";
import * as AircraftModelService from "../services/aircraftModelService";
import AircraftModel from "../models/aircraftModelInterface";
import * as CrewPositionService from "../services/crewPositionService";
import CrewPosition from "../models/crewPositionInterface";

const POPULATION_SIZE: number = 200;
const MAX_FLIGHTS: number = 23;

let avaliable_genes: Array<Array<number>> = [
  Array.from({length:11}, (_,i) => i + 1),
  [],
  Array.from({length:48}, (_,i) => i + 1)
];

const schedule_start: Date = new Date(2020, 10, 16);
const schedule_end: Date = new Date(2020, 10, 20, 20);

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
    for (let i = 0; i < avaliable_genes.length; i++) {
      if (i === 0) {
        flight_chromosome.push(random_date_in_range(schedule_start, schedule_end));
      } else if (i === 1) {
        let hours: number = 4;
        let end_flight_time: Date = new Date(flight_chromosome[0].valueOf());
        end_flight_time.setHours(end_flight_time.getHours() + hours);
        flight_chromosome.push(end_flight_time);
      } else {
        flight_chromosome.push(this.mutated_genes(avaliable_genes[i]));
      }
    }
    return flight_chromosome;
  }

  static create_gnome(): Array<Array<any>> {
    let schedule_gnome: Array<any> = [];
    for (let i = 0; i < MAX_FLIGHTS; i++) {
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


async function generate_schedule(): Promise<any> {
  const aircrafts: Array<Aircraft> = await AircraftService.getAllAvaliableAircrafts();
  const aircraft_models: Array<AircraftModel> = await AircraftModelService.getAllAircraftModels();
  const crew_positions: Array<CrewPosition> = await CrewPositionService.getAllCrewPositions();
  console.log("Aircrafts:", aircrafts);
  console.log("Aircraft Models", aircraft_models);
  console.log("Crew_positions", crew_positions);
  return 1;

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
    console.log("Generation", generation, " Fitness", population[0].fitness,"\n", sorted_apex.printChromosome());


    if (population[0].fitness <= 0) {
      found = true;
      return {schedule: population[0], generation: generation};
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

async function generate_tester() {
  let new_schedule = await generate_schedule();
  console.log("Tester!");
  return;
  console.log("Done! Generation", new_schedule.generation, " Fitness", new_schedule.schedule.fitness, new_schedule.schedule.printChromosome());
}

generate_tester();
