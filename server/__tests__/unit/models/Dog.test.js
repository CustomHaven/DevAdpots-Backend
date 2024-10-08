const db = require("../../../db/connect");
const Dog = require("../../../models/Dog");

let resultObject;
const datetime = new Date();
const datenow = datetime.toISOString().replace(/T/, " ").replace(/\..+/, "");

xdescribe("Dog Model", () => {

    beforeEach(() => {
        resultObject = {
            dog_id: 1,
            dog_name: "dog1",
            gender: "female",
            colour: "black",
            age: 1,
            size: "small",
            breed: "Pomeranian",
            young_children_compatibility: true,
            small_animal_compatibility: true,
            activity_levels: "medium",
            living_space_size: "small",
            garden: true,
            allergenic: "medium",
            other_animals: true,
            fencing: "4",
            experience_required: true,
            photo: "https://someimage.jpg",
            shelter_location_postcode: "SW1A 2AA",
            adopted: true,
            timestamp: datetime,
            neutered: true,
            microchipped: true,
            collar_leash: true,
            obedience_classes_needed: true,
            InitialAdoption: {
                initial_id: 2,
                calculated_initial_price: "363.90",
                neutering_price_id: 1,
                microchip_price: 10.9,
                bed_size_id: 1,
                collar_leash_price: 15,
                obedience_classes_price: 65,
                dog_id: 1,
                neutering_price: 248,
                bed_price: 25
            },
            MonthlyAdoption: {
                monthly_id: 3,
                calculated_monthly_cost: "100.00",
                amount_of_food_id: 1,
                pet_insurance_id: 1,
                veterinary_care_id: 1,
                dog_id: 1,
                vet_price: 55,
                pet_insurance_price: 25,
                food_price: 20
            },
            LongTermAdoption: {
                long_term_id: 4,
                calculated_long_term_cost: "1087.00",
                end_of_life_id: 1,
                average_medical_cost: 822,
                dog_id: 1,
                end_of_life_price: 265
            }
        };
        jest.clearAllMocks();
    });


    xdescribe("Constructor", () => {
        it("should create a Dog instance with correct properties", () => {
            const dog = new Dog(resultObject);
            expect(dog.dog_id).toBe(resultObject.dog_id);
            expect(dog.dog_name).toBe(resultObject.dog_name);
            expect(dog.timestamp).toBe(datenow);
            expect(dog).toEqual({ ...resultObject, timestamp: datenow });
        });
    });

    describe("getAll", () => {
        it("should return list of all dogs", async () => {
            // Arrange
            const mockResults = [
                {
                    ...resultObject
                },
                {
                    ...resultObject, dog_id: 2, dog_name: "dog2", age: 2
                },
                {
                    ...resultObject, dog_id: 3, dog_name: "dog3", age: 3
                },
            ];

            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockResults });


            // Act
            const results = await Dog.getAll();

            // Assert
            expect(Dog).toBeDefined();
            expect(Dog.getAll).toBeDefined();
            expect(db.query).toHaveBeenCalledTimes(31);
            expect(results[2].dog_id).toBe(3);
            expect(results.every(result => result instanceof Dog)).toBe(true);
        });

        it("throws an error if no dogs are found", async () => {
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

            await expect(Dog.getAll()).rejects.toThrow("No dogs available")
        })
    });


    describe("create", () => {
        let copyResultObject;
        beforeEach(() => {
            copyResultObject = { ...resultObject };
            delete copyResultObject.dog_id;
        });

        it("throws if crucial input keys are missing", async () => {
            delete copyResultObject.breed;
            // Test with missing key breed
            await expect(Dog.create(copyResultObject)).rejects.toThrow("At least one of the required fields is missing");
            delete copyResultObject.question_id;

            // Alternatively, test with missing key breed and size
            delete copyResultObject.size;
            await expect(Dog.create(copyResultObject)).rejects.toThrow("At least one of the required fields is missing");

            // Alternatively, test with no arguments
            await expect(Dog.create({})).rejects.toThrow("At least one of the required fields is missing");
        });

        it("throws if any required field is missing individually", async () => {
            const requiredFields = [
                "dog_name", "gender", "colour", "age", "size", "breed", "young_children_compatibility",
                "small_animal_compatibility", "activity_levels", "living_space_size", "garden",
                "allergenic", "other_animals", "fencing", "experience_required"
            ];
    
            for (const field of requiredFields) {
                const invalidData = { ...copyResultObject };
                delete invalidData[field];
                await expect(Dog.create(invalidData)).rejects.toThrow("At least one of the required fields is missing");
            }
        });

        it("resolves with a dog on successful creation", async () => {
            // Arrange
            const queryResult = [
                { ...resultObject, dog_id: 5 }
            ];
            const mockResult = { ...resultObject, dog_id: 5, timestamp: datenow };
            delete mockResult.InitialAdoption;
            delete mockResult.MonthlyAdoption;
            delete mockResult.LongTermAdoption;
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: queryResult });

            // Act
            const result = await Dog.create(copyResultObject);
            console.log("TEST RESOLVE", mockResult);
            // Assert
            expect(result).toBeInstanceOf(Dog);
            expect(result.dog_id).toBe(5);
            expect(result.size).toBe("small");


            expect(db.query).toHaveBeenCalledTimes(2);
            expect(result).toEqual(mockResult)
        });

        it("should throw an Error if dog already exists", async () => {
            // Arrange
            const mockResults = [ resultObject ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockResults });

            // Act & Arrange
            await expect(Dog.create(resultObject)).rejects.toThrow("Dog already exist");
            expect(db.query).toHaveBeenCalledWith(`SELECT * FROM dogs WHERE dog_id = $1`, [resultObject.dog_id]);
        });
    });


    describe("show", () => {
        it("resolves with a dog on successful db query", async () => {
            // Arrange
            const mockResults = [
                resultObject
            ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockResults });

            // Act
            const result = await Dog.show(1);

            // Assert
            expect(result).toBeInstanceOf(Dog);
            expect(result.dog_id).toBe(1);
            expect(result.size).toBe("small");
            expect(db.query).toHaveBeenCalledWith("SELECT * FROM dogs WHERE dog_id = $1;", [1]);
        });

        it("should throw an Error if no dog is found", async () => {
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

            await expect(Dog.show(2)).rejects.toThrow("No dog found");
            expect(db.query).toHaveBeenCalledWith("SELECT * FROM dogs WHERE dog_id = $1;", [2]);
        });
    });



    describe("update", () => {
        let copyResultObject;
        beforeEach(() => {
            copyResultObject = { ...resultObject };
            delete copyResultObject.size;

            copyResultObject.size = "large";
        });

        it("updates dog on successful db query", async () => {
            // Arrange

            const mockResults = [
                { 
                    ...resultObject, 
                    size: copyResultObject.size, 
                    timestamp: new Date(),
                }
            ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockResults });
            const mockResult = mockResults[0];
            delete mockResult.InitialAdoption;
            delete mockResult.MonthlyAdoption;
            delete mockResult.LongTermAdoption;

            const correctTime = mockResult.timestamp.toISOString().replace("T", " ").replace(/\..+/, "");
            // Act


            const result = new Dog(resultObject);
            expect(result.size).toBe("small");

            const updatedResult = await result.update(copyResultObject);

            // Assert
            expect(result).toBeInstanceOf(Dog);
            expect(result.size).toBe("large");

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(updatedResult).toEqual({
                ...mockResult,
                timestamp: correctTime
            });
        });

        it("should throw an Error if db query returns unsuccessful", async () => {
            // Arrange
            const mockResult = {
                    ...copyResultObject,
                    score: copyResultObject.score
            }

            // Act
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });
            const result = new Dog(resultObject);

            // Arrange
            await expect(result.update(copyResultObject)).rejects.toThrow("Failed to update dog");
            expect(db.query).toHaveBeenCalledWith(`UPDATE dogs
                                            SET dog_name = $1, gender = $2, colour = $3, age = $4, size = $5, breed = $6, young_children_compatibility = $7, 
                                            small_animal_compatibility = $8, activity_levels = $9, living_space_size = $10, garden = $11, allergenic = $12,
                                            other_animals = $13, fencing = $14, experience_required = $15, adopted = $16, timestamp = $17, photo = $18, 
                                            shelter_location_postcode = $19
                                            WHERE dog_id = $20
                                            RETURNING *`, 
                                            [
        result.dog_name, result.gender, result.colour, result.age, result.size, result.breed, result.young_children_compatibility, result.small_animal_compatibility, 
        result.activity_levels, result.living_space_size, result.garden, result.allergenic, result.other_animals, result.fencing, 
        result.experience_required, result.adopted, result.timestamp, result.photo, result.shelter_location_postcode, result.dog_id
                                            ]);
        });
    });


    describe("destroy", () => {
        it("destroys a result on successful db query", async () => {
            // Arrange
            const mockResults = [ resultObject ];
            jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockResults });

            delete resultObject.InitialAdoption;
            delete resultObject.MonthlyAdoption;
            delete resultObject.LongTermAdoption;

            // Act
            const result = new Dog(resultObject);
            const deletedResult = await result.destroy();
            const mockResult = mockResults[0];

            const correctTime = mockResult.timestamp.toISOString().replace("T", " ").replace(/\..+/, "");

            // Assert
            expect(result).toBeInstanceOf(Dog);
            expect(result.size).toBe("small");
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(deletedResult).toEqual({
                ...resultObject,
                timestamp: correctTime
            });
        });

        it("should throw an Error if db query returns unsuccessful", async () => {
            // Act & Arrange
            jest.spyOn(db, "query").mockRejectedValue(new Error("Something wrong with the DB"));
            const result = new Dog(resultObject);
            await expect(result.destroy()).rejects.toThrow("Something wrong with the DB")
        });
    });

});