// Define variables
let screen_width = 800;
let screen_height = 600;
let block_size = 50;
let player_pos;
let collectible_pos;
let enemies_red = [];
let enemies_purple = [];
let enemies_orange = [];
let enemies_green = [];
let key_presses = 0;
let spawn_count_red = 0;
let spawn_count_purple = 0;
let spawn_count_orange = 0;
let spawn_count_green = 0;
let turns_moved = 0;
let yellow_collected = 0;
let green_collected = 0;

let soundEffect;
let soundEffect2;
let isMuted = false;
let imageLoaded = false;
let backgroundImage;
let imageURL = 'https://picsum.photos/800/800?grayscale';

function preload() {
    backgroundImage = loadImage(imageURL, function(img) {
        backgroundImage = img;
        imageLoaded = true;
        print("Background image loaded successfully!"); // Debug message
        loop(); // Start the draw loop once background image is loaded
    });
}

document.addEventListener("DOMContentLoaded", function() {
    // Attach event listener to the mute/unmute button
    document.getElementById("muteButton").addEventListener("click", function() {
        // Load sound files only when the button is clicked
        soundEffect = loadSound('https://cdn.jsdelivr.net/gh/Sodarrific/eeeeeeeee-pleeeaaasseee/badnoise.mp3', soundLoaded, soundError); 
        soundEffect2 = loadSound('https://cdn.jsdelivr.net/gh/Sodarrific/eeeeeeeee-pleeeaaasseee/goodnoise.mp3', soundLoaded, soundError); 
    });
});

function soundLoaded() {
    console.log("Sound loaded successfully!");
}

function soundError(e) {
    console.error("Error loading sound:", e);
}

// Function to toggle mute/unmute
function toggleMute() {
    if (isMuted) {
        soundEffect.setVolume(1); // Unmute
        soundEffect2.setVolume(1); // Unmute
        isMuted = false;
        document.getElementById("muteButton").innerText = "Mute Sound";
    } else {
        soundEffect.setVolume(0); // Mute
        soundEffect2.setVolume(0); // Mute
        isMuted = true;
        document.getElementById("muteButton").innerText = "Unmute Sound";
    }
}

// Function to align position to grid
function align_to_grid(pos) {
    return Math.floor(pos / block_size) * block_size;
}

// Function to check if a position is within the specified radius of another position
function within_radius(pos1, pos2, radius) {
    return Math.abs(pos1.x - pos2.x) <= radius * block_size &&
           Math.abs(pos1.y - pos2.y) <= radius * block_size;
}

// Function to check if a position overlaps with any other positions in a list
function overlaps_with_others(pos, others) {
    for (const other of others) {
        if (pos.equals(other)) {
            return true;
        }
    }
    return false;
}

function setup() {
    createCanvas(screen_width, screen_height);
    noLoop();
    player_pos = createVector(
        align_to_grid(floor(screen_width / 2)),
        align_to_grid(floor(screen_height / 2))
    );
    collectible_pos = createVector(
        align_to_grid(floor(random() * (screen_width - block_size))),
        align_to_grid(floor(random() * (screen_height - block_size)))
    );
    
}

// Define a variable to control the opacity of the background image
let backgroundImageOpacity = 255; // Fully opaque initially

function draw() {
    // Draw background image
    if (imageLoaded) {
        tint(255, backgroundImageOpacity); // Apply opacity to the image
        image(backgroundImage, 0, 0, width, height);
    } else {
        // If image is not loaded, draw a gray background
        background(200);
    }

    // Draw player
    fill(0, 0, 255);
    rect(player_pos.x, player_pos.y, block_size, block_size);

    // Draw collectible
    fill(255, 255, 0);
    rect(collectible_pos.x, collectible_pos.y, block_size, block_size);

    // Check collisions with enemies and call teleportAndReset if collision occurs
    let collisionDetected = false;
    for (const enemy of enemies_red.concat(enemies_purple, enemies_orange)) {
        if (player_pos.x === enemy.x && player_pos.y === enemy.y) {
            collisionDetected = true;
            teleportAndReset();
            soundEffect.play(); // Play sound effect on collision
            break;
        }
    }
    for (const enemy of enemies_green) {
        if (player_pos.x === enemy.x && player_pos.y === enemy.y) {
            green_collected++;
            collisionDetected = true;
            teleportPlayer();
            teleportYellowCollectible();
            soundEffect2.play();
            break;
        }
    }

    if (collisionDetected) {
        // Reduce the opacity of the background image gradually
        backgroundImageOpacity -= 5; // Decrease opacity slowly
        if (backgroundImageOpacity < 0) {
            backgroundImageOpacity = 0; // Ensure opacity doesn't go below 0
        }
        // Clear all enemies except blue and yellow squares
        enemies_red = [];
        enemies_purple = [];
        enemies_orange = [];
        enemies_green = [];
        // Call teleportAndReset to reset counters
    }

    // Draw enemies (red)
    fill(255, 0, 0);
    for (const enemy_pos of enemies_red) {
        rect(enemy_pos.x, enemy_pos.y, block_size, block_size);
    }

    // Draw enemies (purple)
    fill(128, 0, 128);
    for (const enemy_pos of enemies_purple) {
        rect(enemy_pos.x, enemy_pos.y, block_size, block_size);
    }

    // Draw enemies (orange)
    fill(255, 165, 0);
    for (const enemy_data of enemies_orange) {
        rect(enemy_data.pos.x, enemy_data.pos.y, block_size, block_size);
    }

    // Draw enemies (green)
    fill(0, 255, 0);
    for (const enemy_pos of enemies_green) {
        rect(enemy_pos.x, enemy_pos.y, block_size, block_size);
    }

    // Check collision with yellow collectible
    if (player_pos.x === collectible_pos.x && player_pos.y === collectible_pos.y) {
        // Teleport player to a random position not overlapping with other squares
        teleportPlayer();
        // Teleport yellow collectible to a random position not overlapping with other squares
        teleportYellowCollectible();
        // Increment yellow squares collected
        yellow_collected++;
    }

    // Draw counters
    fill(0);
    textSize(20);
    text("Turns moved: " + turns_moved, 10, 20);
    text("Yellow squares collected: " + yellow_collected, 10, 40);
    text("Green squares collected: " + green_collected, 10, 60);
}

function teleportAndReset() {
    // Teleport player to a random position not overlapping with other squares
    teleportPlayer();
    // Teleport yellow collectible to a random position not overlapping with other squares
    teleportYellowCollectible();
    // Reset scores to 0
    turns_moved = 0;
    yellow_collected = 0;
    green_collected = 0;
    key_presses = 0;
}

function teleportPlayer() {
    let newPlayerPos;
    do {
        newPlayerPos = createVector(
            align_to_grid(floor(random() * (screen_width - block_size))),
            align_to_grid(floor(random() * (screen_height - block_size)))
        );
    } while (
        overlaps_with_others(newPlayerPos, enemies_red) ||
        overlaps_with_others(newPlayerPos, enemies_purple) ||
        overlaps_with_others(newPlayerPos, enemies_orange) ||
        overlaps_with_others(newPlayerPos, enemies_green)
    );
    player_pos = newPlayerPos;
}

function teleportYellowCollectible() {
    let newCollectiblePos;
    do {
        newCollectiblePos = createVector(
            align_to_grid(floor(random() * (screen_width - block_size))),
            align_to_grid(floor(random() * (screen_height - block_size)))
        );
    } while (
        overlaps_with_others(newCollectiblePos, enemies_red) ||
        overlaps_with_others(newCollectiblePos, enemies_purple) ||
        overlaps_with_others(newCollectiblePos, enemies_orange) ||
        overlaps_with_others(newCollectiblePos, enemies_green) ||
        newCollectiblePos.equals(player_pos)
    );
    collectible_pos = newCollectiblePos;
}

function keyPressed() {
    key_presses++;
    turns_moved++;

    switch (keyCode) {
        case UP_ARROW:
            player_pos.y -= block_size;
            break;
        case DOWN_ARROW:
            player_pos.y += block_size;
            break;
        case LEFT_ARROW:
            player_pos.x -= block_size;
            break;
        case RIGHT_ARROW:
            player_pos.x += block_size;
            break;
    }

    // Move red/purple block only on even key presses
    if (key_presses % 4 === 0) {
        for (const enemy of enemies_red) {
            if (player_pos.x < enemy.x) {
                enemy.x -= block_size;
            } else if (player_pos.x > enemy.x) {
                enemy.x += block_size;
            } else if (player_pos.y < enemy.y) {
                enemy.y -= block_size;
            } else if (player_pos.y > enemy.y) {
                enemy.y += block_size;
            }
        }
    }

    if (key_presses % 2 === 0) {
        for (const enemy of enemies_purple) {
            if (player_pos.x < enemy.x) {
                enemy.x -= block_size;
            } else if (player_pos.x > enemy.x) {
                enemy.x += block_size;
            } else if (player_pos.y < enemy.y) {
                enemy.y -= block_size;
            } else if (player_pos.y > enemy.y) {
                enemy.y += block_size;
            }
        }
    }

    for (const enemy of enemies_orange) {
        if (enemy.turns_still >= 20) {
            // Move the orange enemy towards the player
            if (player_pos.x < enemy.pos.x) {
                enemy.pos.x -= block_size;
            } else if (player_pos.x > enemy.pos.x) {
                enemy.pos.x += block_size;
            } else if (player_pos.y < enemy.pos.y) {
                enemy.pos.y -= block_size;
            } else if (player_pos.y > enemy.pos.y) {
                enemy.pos.y += block_size;
            }
        } else {
            // Increment the turns_still counter
            enemy.turns_still++;
        }
    }

    // Spawn new enemies
    if (key_presses % 20 === 0) {
        let spawn_pos = createVector();
        do {
            spawn_pos.set(
                align_to_grid(floor(random() * (screen_width - block_size))),
                align_to_grid(floor(random() * (screen_height - block_size)))
            );
        } while (
            spawn_pos.equals(player_pos) ||
            within_radius(spawn_pos, player_pos, 3) ||
            overlaps_with_others(spawn_pos, enemies_red)
        );
        enemies_red.push(spawn_pos.copy());
        spawn_count_red++;
    }

    if (key_presses % 40 === 0) {
        let spawn_pos = createVector();
        do {
            spawn_pos.set(
                align_to_grid(floor(random() * (screen_width - block_size))),
                align_to_grid(floor(random() * (screen_height - block_size)))
            );
        } while (
            spawn_pos.equals(player_pos) ||
            within_radius(spawn_pos, player_pos, 3) ||
            overlaps_with_others(spawn_pos, enemies_red) ||
            overlaps_with_others(spawn_pos, enemies_purple)
        );
        enemies_purple.push(spawn_pos.copy());
        spawn_count_purple++;
    }

    if (key_presses % 100 === 0) {
        let spawn_pos = createVector();
        do {
            spawn_pos.set(
                align_to_grid(floor(random() * (screen_width - block_size))),
                align_to_grid(floor(random() * (screen_height - block_size)))
            );
        } while (
            spawn_pos.equals(player_pos) ||
            within_radius(spawn_pos, player_pos, 3) ||
            overlaps_with_others(spawn_pos, enemies_red) ||
            overlaps_with_others(spawn_pos, enemies_purple) ||
            overlaps_with_others(spawn_pos, enemies_orange)
        );
        enemies_orange.push({ pos: spawn_pos.copy(), turns_still: 0 }); // Initialize turns_still to 0
        spawn_count_orange++;
    }

    // Spawn new green square every hundredth key press
    if (key_presses % 100 === 0) {
        let spawn_pos = createVector();
        do {
            spawn_pos.set(
                align_to_grid(floor(random() * (screen_width - block_size))),
                align_to_grid(floor(random() * (screen_height - block_size)))
            );
        } while (
            spawn_pos.equals(player_pos) ||
            within_radius(spawn_pos, player_pos, 3) ||
            overlaps_with_others(spawn_pos, enemies_red) ||
            overlaps_with_others(spawn_pos, enemies_purple) ||
            overlaps_with_others(spawn_pos, enemies_orange) ||
            overlaps_with_others(spawn_pos, enemies_green)
        );
        enemies_green.push(spawn_pos.copy());
        spawn_count_green++;
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> c7916a060cdef738650238af7e76c74fb5087cef
