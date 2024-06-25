#pragma once

#include <pebble.h>
#include "scrolling_menu.h"

// Structure to hold information about a transit stop
typedef struct {
    char *name;
    int next_time_minutes;
    char *destination;
    GColor color; // Color for the menu item
    GColor highlight_color; // Color for the menu item when highlighted
} TransitStop;

// Function declarations
void transit_init(void);
void transit_deinit(void);
void transit_add_stop(char *name, int next_time_minutes, char *destination, GColor color, GColor highlight_color);
void refresh_menu(void);
MenuItem* getMenuItem(WindowData* window_data, int index);
