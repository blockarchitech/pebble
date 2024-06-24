#include <pebble.h>
#include "scrolling_menu.h"
#include "transit.h"

void selection_changed_callback(MenuLayer *cell_layer, MenuIndex new_index, MenuIndex old_index, void *callback_context) {
    WindowData* window_data = (WindowData*)callback_context;
    window_data->moving_forwards_in_menu = new_index.row >= old_index.row;
    if (!window_data->menu_reloading_to_scroll) {
        initiate_menu_scroll_timer(window_data);
    } else {
        window_data->menu_reloading_to_scroll = false;
    }
}

void initiate_menu_scroll_timer(WindowData* window_data) {
    bool need_to_create_timer = true;
    window_data->scrolling_still_required = true;
    window_data->menu_scroll_offset = 0;
    window_data->menu_reloading_to_scroll = false;
    if (window_data->menu_scroll_timer) {
        need_to_create_timer = !app_timer_reschedule(window_data->menu_scroll_timer, SCROLL_MENU_ITEM_WAIT_TIMER);
    }
    if (need_to_create_timer) {
        window_data->menu_scroll_timer = app_timer_register(SCROLL_MENU_ITEM_WAIT_TIMER, scroll_menu_callback, window_data);
    }
}

void scroll_menu_callback(void* data) {
    WindowData* window_data = (WindowData*)data;
    if (!window_data->menu) {
        return;
    }
    window_data->menu_scroll_timer = NULL;
    window_data->menu_scroll_offset++;
    if (!window_data->scrolling_still_required) {
        return;
    }

    MenuIndex menuIndex = menu_layer_get_selected_index(window_data->menu);
    if (menuIndex.row != 0) {
        window_data->menu_reloading_to_scroll = true;
    }
    window_data->scrolling_still_required = false;
    menu_layer_reload_data(window_data->menu);
    window_data->menu_scroll_timer = app_timer_register(SCROLL_MENU_ITEM_TIMER, scroll_menu_callback, window_data);
}

void get_menu_text(WindowData* window_data, int index, char** text, char** subtext) {
    // Replace with your logic to get menu items
    MenuItem* menu_item = getMenuItem(window_data, index);
    *text = menu_item ? menu_item->text : NULL;
    APP_LOG(APP_LOG_LEVEL_DEBUG, "Menu item text: %s", *text);
    *subtext = menu_item && menu_item->flags & ITEM_FLAG_TWO_LINER ? menu_item->text + strlen(menu_item->text) + 1 : NULL;
    if (*subtext != NULL && strlen(*subtext) == 0) {
        *subtext = NULL;
    }

    MenuIndex menuIndex = menu_layer_get_selected_index(window_data->menu);
    if (*text && menuIndex.row == index) {
        int len = strlen(*text);
        if (len - MENU_CHARS_VISIBLE - window_data->menu_scroll_offset > 0) {
            *text += window_data->menu_scroll_offset;
            window_data->scrolling_still_required = true;
        }
    }
}
