/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50718
 Source Host           : 127.0.0.1
 Source Database       : chat

 Target Server Type    : MySQL
 Target Server Version : 50718
 File Encoding         : utf-8

 Date: 11/13/2017 15:47:41 PM
*/

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `privateRooms`
-- ----------------------------
DROP TABLE IF EXISTS `privateRooms`;
CREATE TABLE `privateRooms` (
  `roomid` varchar(25) NOT NULL,
  `owner` varchar(25) NOT NULL,
  `room_pwd` varchar(255) NOT NULL,
  PRIMARY KEY (`roomid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `privateRooms`
-- ----------------------------
BEGIN;
INSERT INTO `privateRooms` VALUES ('501', 'miao', '$2a$10$GpJJAz31Td6S/2h4rkON6.GQSt.BoIhZDoB0dURupo58xmwcxJCta'), ('514', 'kevin', '$2a$10$oeBBTilbaHgxahBZ.Zolie.YPwAQ/M0cY1uGpyvnTy6eSzYKd3Hzi'), ('560', 'miao', '$2a$10$KPj/HpCUMAEd6/dt0wpf7.uHMlKUa.Iv6Tk1tES.q1U..zRgVs6oG');
COMMIT;

-- ----------------------------
--  Table structure for `users`
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `userid` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(25) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`userid`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `users`
-- ----------------------------
BEGIN;
INSERT INTO `users` VALUES ('23', 'kevin', '$2a$10$/Oyj4KyClM51c8CHcwSRs..han2tYa3kXr9gSLEHb.PCiUcyIF58G'), ('24', 'kirk', '$2a$10$a5HWMOiQpBNGTW6gJvFJK.akMVUmWpwTP.L/UuzsMGSHr08F3sau2'), ('25', 'miao', '$2a$10$3MKVI3f51Lag4nifb/rT1eYiQTmSoyK947ngcJXfDXNNzAUsWD4DK');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
