package com.tablebooking.config;

import com.tablebooking.entity.RestaurantTable;
import com.tablebooking.entity.TableStatus;
import com.tablebooking.repository.RestaurantTableRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TableDataInitializer {

    @Bean
    CommandLineRunner initializeTables(RestaurantTableRepository tableRepository) {
        return args -> {
            if (tableRepository.count() > 0) {
                return;
            }

            saveTable(tableRepository, 1, 2);
            saveTable(tableRepository, 2, 4);
            saveTable(tableRepository, 3, 6);
            saveTable(tableRepository, 4, 4);
        };
    }

    private void saveTable(RestaurantTableRepository repository, int tableNumber, int capacity) {
        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(tableNumber);
        table.setCapacity(capacity);
        table.setStatus(TableStatus.AVAILABLE);
        repository.save(table);
    }
}