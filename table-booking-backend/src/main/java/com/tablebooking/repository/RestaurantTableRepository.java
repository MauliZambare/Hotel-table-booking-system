package com.tablebooking.repository;

import com.tablebooking.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    boolean existsByTableNumber(Integer tableNumber);
    Optional<RestaurantTable> findByTableNumberAndIdNot(Integer tableNumber, Long id);
    List<RestaurantTable> findAllByOrderByTableNumberAsc();
}