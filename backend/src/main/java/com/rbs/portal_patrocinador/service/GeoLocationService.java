package com.rbs.portal_patrocinador.service;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.model.CityResponse;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.InetAddress;

@Service
public class GeoLocationService {

    private final DatabaseReader dbReader;

    public GeoLocationService() throws Exception {

        ClassPathResource resource = new ClassPathResource("GeoLite2-City.mmdb");
        try (InputStream inputStream = resource.getInputStream()) {
            this.dbReader = new DatabaseReader.Builder(inputStream).build();
        }
    }

    public double[] getCoordinates(String ip) {
        try {
            InetAddress ipAddress = InetAddress.getByName(ip);
            CityResponse response = dbReader.city(ipAddress);
            return new double[]{response.getLocation().getLatitude(), response.getLocation().getLongitude()};
        } catch (Exception e) {
            return new double[]{0, 0};
        }
    }

    // Fórmula de Haversine (mantenha como estava)
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}