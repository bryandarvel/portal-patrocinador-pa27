package com.rbs.portal_patrocinador.service;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.model.CityResponse;
import org.springframework.stereotype.Service;
import java.io.File;
import java.net.InetAddress;

@Service
public class  GeoLocationService {

    private final DatabaseReader dbReader;

    public GeoLocationService() throws Exception {
        // Carrega o banco de dados GeoLite2 (coloque o arquivo na pasta resources)
        File database = new File("src/main/resources/GeoLite2-City.mmdb");
        this.dbReader = new DatabaseReader.Builder(database).build();
    }

    public double[] getCoordinates(String ip) {
        try {
            InetAddress ipAddress = InetAddress.getByName(ip);
            CityResponse response = dbReader.city(ipAddress);
            return new double[]{response.getLocation().getLatitude(), response.getLocation().getLongitude()};
        } catch (Exception e) {
            return new double[]{0, 0}; // Retorna 0 se não conseguir localizar
        }
    }

    // Fórmula de Haversine para calcular distância em KM
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Raio da Terra em KM
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}