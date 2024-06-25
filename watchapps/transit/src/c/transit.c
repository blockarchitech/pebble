#include <pebble.h>
#include "transit.h"
#include "scrolling_menu.h"

#define MAX_STOPS 90

static Window *s_main_window;
static MenuLayer *s_menu_layer;
static TransitStop s_stops[MAX_STOPS];
static int s_num_stops = 0;

static GFont s_leco_font;
static WindowData s_window_data;

MenuItem menu_items[MAX_STOPS]; // Array to store menu items

MenuItem* getMenuItem(WindowData* window_data, int index) {
    if (index >= 0 && index < s_num_stops) {
        return &menu_items[index];
    }
    return NULL;
}


// MenuLayer callbacks
static uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data) {
    return 1;
}

static uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
    return s_num_stops;
}

static int16_t menu_get_cell_height_callback(MenuLayer *menu_layer, MenuIndex *cell_index, void *data) {
    return 70; // Increased height for expanded items
}

static void draw_time_text(GContext *ctx, GRect rect, int minutes) {
    // Draw time using LECO font
    char buffer[8];
    snprintf(buffer, sizeof(buffer), "%d", minutes);
    
    // Calculate position for center-right placement
    GRect time_rect = GRect(rect.origin.x + rect.size.w - 40, rect.origin.y, 40, rect.size.h);
    
    graphics_context_set_text_color(ctx, GColorBlack);
    graphics_draw_text(ctx, buffer, s_leco_font, time_rect, GTextOverflowModeFill, GTextAlignmentRight, NULL);
    
    // Draw "min" text
    graphics_draw_text(ctx, "min", fonts_get_system_font(FONT_KEY_GOTHIC_18), GRect(rect.origin.x + rect.size.w - 40, rect.origin.y + rect.size.h / 2, 40, rect.size.h / 2), GTextOverflowModeFill, GTextAlignmentRight, NULL);
}


static void menu_draw_row_callback(GContext *ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
    TransitStop *stop = &s_stops[cell_index->row];
    GRect bounds = layer_get_bounds(cell_layer);

        // Draw colored background
    graphics_context_set_fill_color(ctx, menu_cell_layer_is_highlighted(cell_layer) ? stop->highlight_color : stop->color);
    graphics_fill_rect(ctx, bounds, 0, GCornerNone);

    // Draw stop name with scrolling text
    graphics_context_set_text_color(ctx, GColorBlack);
    graphics_draw_text(ctx, stop->name, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD),
                       GRect(4, 0, bounds.size.w - 48, 30), GTextOverflowModeFill, GTextAlignmentLeft, NULL);
    
    // Draw destination with scrolling text
    graphics_draw_text(ctx, stop->destination, fonts_get_system_font(FONT_KEY_GOTHIC_18),
                       GRect(4, 30, bounds.size.w - 48, 20), GTextOverflowModeFill, GTextAlignmentLeft, NULL);
    
    // Draw time remaining
    draw_time_text(ctx, bounds, stop->next_time_minutes);
}

static void menu_draw_background_callback(GContext *ctx, const Layer *cell_layer, bool highlight, void *data) {
    // not required for now, do nothing
}

// Initialize the main window and MenuLayer
void transit_init(void) {
    s_main_window = window_create();
    Layer *window_layer = window_get_root_layer(s_main_window);
    GRect bounds = layer_get_bounds(window_layer);

    s_menu_layer = menu_layer_create(bounds);
    menu_layer_set_callbacks(s_menu_layer, &s_window_data, (MenuLayerCallbacks) {
        .get_num_sections = menu_get_num_sections_callback,
        .get_num_rows = menu_get_num_rows_callback,
        .get_cell_height = menu_get_cell_height_callback,
        .draw_row = menu_draw_row_callback,
        .draw_background = menu_draw_background_callback,
        .selection_changed = selection_changed_callback,
    });

    s_window_data.menu = s_menu_layer;
    s_window_data.menu_scroll_timer = NULL;
    s_window_data.menu_reloading_to_scroll = false;
    s_window_data.scrolling_still_required = false;
    s_window_data.moving_forwards_in_menu = true;
    s_window_data.menu_scroll_offset = 0;

    s_leco_font = fonts_get_system_font(FONT_KEY_LECO_32_BOLD_NUMBERS);

    menu_layer_set_click_config_onto_window(s_menu_layer, s_main_window);
    layer_add_child(window_layer, menu_layer_get_layer(s_menu_layer));

    window_stack_push(s_main_window, true);
}

// Cleanup resources
void transit_deinit(void) {
    // Unload LECO font
    fonts_unload_custom_font(s_leco_font);

    // Destroy MenuLayer
    menu_layer_destroy(s_menu_layer);

    // Destroy main window
    window_destroy(s_main_window);
}

// Example function to add a stop to the list
void transit_add_stop(char *name, int next_time_minutes, char *destination, GColor color, GColor highlight_color) {
    if (s_num_stops < MAX_STOPS) {
        s_stops[s_num_stops].name = name;
        s_stops[s_num_stops].next_time_minutes = next_time_minutes;
        s_stops[s_num_stops].destination = destination;
        s_stops[s_num_stops].color = color;
        s_stops[s_num_stops].highlight_color = highlight_color;


        menu_items[s_num_stops].text = name;
        menu_items[s_num_stops].subtext = destination;
        menu_items[s_num_stops].flags = ITEM_FLAG_TWO_LINER;

        s_num_stops++;   
    }
}

void refresh_menu(void) {
    menu_layer_reload_data(s_menu_layer);
}
