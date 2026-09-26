package com.tablebooking.service;

import com.tablebooking.dto.TableRequest;
import com.tablebooking.dto.TableResponse;
import com.tablebooking.entity.RestaurantTable;
import com.tablebooking.exception.ConflictException;
import com.tablebooking.exception.ResourceNotFoundException;
import com.tablebooking.repository.RestaurantTableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TableService {

    private final RestaurantTableRepository tableRepository;

    public TableService(RestaurantTableRepository tableRepository) {
        this.tableRepository = tableRepository;
    }

    @Transactional(readOnly = true)
    public List<TableResponse> findAll() {
        return tableRepository.findAllByOrderByTableNumberAsc().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TableResponse findById(Long id) {
        return toResponse(getTable(id));
    }

    @Transactional
    public TableResponse create(TableRequest request) {
        if (tableRepository.existsByTableNumber(request.tableNumber())) {
            throw new ConflictException("A table with number " + request.tableNumber() + " already exists.");
        }

        RestaurantTable table = new RestaurantTable();
        applyRequest(table, request);
        return toResponse(tableRepository.save(table));
    }

    @Transactional
    public TableResponse update(Long id, TableRequest request) {
        RestaurantTable table = getTable(id);
        tableRepository.findByTableNumberAndIdNot(request.tableNumber(), id).ifPresent(existing -> {
            throw new ConflictException("A table with number " + request.tableNumber() + " already exists.");
        });
        applyRequest(table, request);
        return toResponse(tableRepository.save(table));
    }

    @Transactional
    public void delete(Long id) {
        tableRepository.delete(getTable(id));
    }

    private RestaurantTable getTable(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant table " + id + " was not found."));
    }

    private void applyRequest(RestaurantTable table, TableRequest request) {
        table.setTableNumber(request.tableNumber());
        table.setCapacity(request.capacity());
        table.setStatus(request.status());
    }

    private TableResponse toResponse(RestaurantTable table) {
        return new TableResponse(table.getId(), table.getTableNumber(), table.getCapacity(), table.getStatus());
    }
}