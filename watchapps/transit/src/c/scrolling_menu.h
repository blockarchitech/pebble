#pragma once

#include <pebble.h>

#define SCROLL_MENU_ITEM_WAIT_TIMER 500
#define SCROLL_MENU_ITEM_TIMER 200
#define MENU_CHARS_VISIBLE 9

typedef struct {
    char *text;
    char *subtext;
    uint8_t flags;
} MenuItem;

#define ITEM_FLAG_TWO_LINER 1

typedef struct {
    MenuLayer *menu;
    AppTimer *menu_scroll_timer;
    bool menu_reloading_to_scroll;
    bool scrolling_still_required;
    bool moving_forwards_in_menu;
    int menu_scroll_offset;
} WindowData;

void selection_changed_callback(MenuLayer *cell_layer, MenuIndex new_index, MenuIndex old_index, void *callback_context);
void initiate_menu_scroll_timer(WindowData* window_data);
void scroll_menu_callback(void* data);
void get_menu_text(WindowData* window_data, int index, char** text, char** subtext);
