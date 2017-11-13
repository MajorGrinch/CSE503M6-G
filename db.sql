create table users(
	userid int not null auto_increment,
	username varchar(25) not null,
	password varchar(255) not null,
	primary key (userid),
	UNIQUE (username)
)engine = InnoDB default character set = utf8 collate = utf8_general_ci;

create table privateRooms(
	roomid varchar(25) not null,
	owner varchar(25) not null,
	room_pwd varchar(255) not null,
	primary key (roomid)
)engine = InnoDB default character set = utf8 collate = utf8_general_ci;