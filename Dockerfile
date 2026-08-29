FROM php:8.2-apache

RUN a2enmod rewrite

# Configura o Apache para servir index.html como padrão
RUN echo "DirectoryIndex index.html index.php" >> /etc/apache2/apache2.conf

COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html/
