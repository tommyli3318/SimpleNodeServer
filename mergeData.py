import csv

trips = dict() # contact_id -> {everything associated with that contact}
with open('fake_finity_data/trip_data.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        contact_id = row['contact_id']
        del row['contact_id']
        trips[contact_id] = row


merged = []
with open('fake_finity_data/contacts.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        row.update(trips[row['id']]) # merge the two dictionaries
        merged.append(row)


with open('contactsWithTripData.csv', 'w', newline='') as csvfile:
    fieldnames = ['id', 'first_name', 'last_name', 'email', 'gender', 'trip_id', 'trip_origin_latitude', 
                    'trip_origin_longitude', 'trip_dest_latitude', 'trip_dest_longitude', 'trip_expense_total']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    
    for row in merged:
        writer.writerow(row)

# contactsWithTripData.csv is now a csv file of contacts and trip_data merged on contact_id