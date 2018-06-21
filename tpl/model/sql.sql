CREATE TABLE IF NOT EXISTS `xxx_choose_zone` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uin` bigint(20) NOT NULL,
  `game_id` varchar(20) NOT null,
  `zone` varchar(20) NOT NULL,
  `nick` varchar(32) DEFAULT NULL,
  `charac_no` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `uin` (`uin`)
) ENGINE=Innodb DEFAULT CHARSET=gbk COMMENT='绑定大区记录' AUTO_INCREMENT=1 ;



CREATE TABLE IF NOT EXISTS `xxx_present_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uin` bigint(20) NOT NULL,
  `created` datetime NOT NULL,
  `present_id` varchar(32) NOT NULL COMMENT '礼包ID',
  `present` varchar(1024) NOT NULL,
  `level` smallint(8) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `present_id_level` (`present_id`,`level`),
  KEY `uin_present_id` (`uin`,`present_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=gbk COMMENT='领取礼包记录';





CREATE TABLE `xxx_lottery_chance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uin` bigint(20) NOT NULL,
  `created` datetime NOT NULL,
  `present_id` varchar(32) NOT NULL COMMENT '1=rule1,2=rule2',
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0=init, 1=get_lottery',
  `lottery_time` datetime DEFAULT NULL COMMENT '抽奖时间',
  PRIMARY KEY (`id`),
  KEY `uin` (`uin`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=gbk;



