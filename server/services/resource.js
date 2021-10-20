module.exports = class ResourceService {

    constructor(randomService, distanceService) {
        this.randomService = randomService;
        this.distanceService = distanceService;
    }

    setResources(game, locations, resourceDistribution) {
        let newLocations;
        switch (resourceDistribution) {
            case 'random': 
                newLocations = this.setResourcesRandom(game, locations);
                break;
            case 'weightedCenter':
                // check if the galaxy type supports this method of distributing resources, if not, do the random method.
                if(['doughnut', 'irregular'].includes(game.settings.galaxy.galaxyType)) return this.setResources(game, locations, 'random');

                newLocations = this.setResourcesWeightedCenter(game, locations);
                break;
            default:
                throw new ValidationError(`Unsupported resource distribution type: ${resourceDistribution}`);
        }
        return newLocations;
    }

    setResourcesRandom(game, locations) {
        // Allocate random resources.
        let RMIN = game.constants.star.resources.minNaturalResources;
        let RMAX = game.constants.star.resources.maxNaturalResources;

        if (game.settings.galaxy.galaxyType == 'circular-balanced') {
            let playerCount = game.settings.general.playerLimit
            for (let i = 0; i < locations.length / playerCount; i++) {
                let r = this.randomService.getRandomNumberBetween(RMIN, RMAX);
                for (let j = 0; j < playerCount; j++){
                    location[i*playerCount+j].resources = Math.floor(r);
                }
            }
        } else {
            for (let location of locations) {
                let r = this.randomService.getRandomNumberBetween(RMIN, RMAX);
                location.resources = Math.floor(r);
            }
        }

        return locations;
    }

    setResourcesWeightedCenter(game, locations) {
        // The closer to the center of the galaxy, the more likely (exponentially) to find stars with higher resources.
        let RMIN = game.constants.star.resources.minNaturalResources;
        let RMAX = game.constants.star.resources.maxNaturalResources;
        let galaxyRadius = this.getGalaxyDiameter(locations).x / 2;
        let galacticCenter = {x:0, y:0};

        if (game.settings.galaxy.galaxyType == 'circular-balanced') {
            for (let i = 0; i < locations.length / playerCount; i++) {
                let radius = this.distanceService.getDistanceBetweenLocations(galacticCenter, locations[i*playerCount]);
                let resources = this.randomService.getRandomNumberBetweenEXP(RMIN, RMAX, radius/galaxyRadius);
                for (let j = 0; j < playerCount; j++){
                    locations[i*playerCount + j].resources = resources;
                }
            }
        } else {
            for (let location of locations) {
                let radius = this.distanceService.getDistanceBetweenLocations(galacticCenter, location)
                let resources = this.randomService.getRandomNumberBetweenEXP(RMIN, RMAX, radius/galaxyRadius)
                location.resources = resources;
            }
        }

        return locations;
    }

    getGalaxyDiameter(locations) {
        let maxX = locations.sort((a, b) => b.x - a.x)[0].x;
        let maxY = locations.sort((a, b) => b.y - a.y)[0].y;
        let minX = locations.sort((a, b) => a.x - b.x)[0].x;
        let minY = locations.sort((a, b) => a.y - b.y)[0].y;

        return {
            x: maxX - minX,
            y: maxY - minY,
        };
    }
}