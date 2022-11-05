#! /bin/bash

docker run --rm -it \
    -p 8080:8080 \
    -v $(pwd)/customer:/customer \
    -e ASPNETCORE_URLS=http://+:8080 \
    -e DOTNET_ENVIRONMENT=DockerLocal \
    -e APIs__GuestExperience="http://host.docker.internal:8081/" \
    -e APIS__TableService="http://host.docker.internal:8082/" \
    -e APIS__Billing="http://host.docker.internal:8083/" \
    mcr.microsoft.com/dotnet/sdk:6.0 \
    dotnet run --no-launch-profile --project /customer/Customer.csproj
 