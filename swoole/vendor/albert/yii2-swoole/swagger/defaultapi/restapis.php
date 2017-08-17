<?php
/**
 * @SWG\Post(path="/index",
 *     tags={""},
 *     summary="通用列表查询",
 *     description="返回查询结果",
 *       produces = {"application/json"},
 *       consumes = {"application/json"},
 *     @SWG\Parameter(
 *        in = "query",
 *        name = "page",
 *        description = "页数",
 *        required = false,
 *        type = "string"
 *     ),
 *     @SWG\Parameter(
 *        in = "body",
 *        name = "body",
 *        description = "json字符串结构",
 *        required = false,
 *        type = "string",
 *        schema = "{}"
 *     ),
 *
 *     @SWG\Response(
 *         response = 200,
 *         description = "success"
 *     )
 * )
 *
 */

/**
 * @SWG\Post(path="/create",
 *     tags={""},
 *     summary="通用新增",
 *     description="返回新增结果",
 *       produces = {"application/json"},
 *       consumes = {"application/json"},
 *     @SWG\Parameter(
 *        in = "body",
 *        name = "body",
 *        description = "json字符串结构",
 *        required = true,
 *        type = "string",
 *        schema = "{}"
 *     ),
 *
 *     @SWG\Response(
 *         response = 200,
 *         description = "success"
 *     )
 * )
 *
 */

/**
 * @SWG\Post(path="/update",
 *     tags={""},
 *     summary="通用修改",
 *     description="返回修改结果",
 *       produces = {"application/json"},
 *       consumes = {"application/json"},
 *     @SWG\Parameter(
 *        in = "query",
 *        name = "id",
 *        description = "主键",
 *        required = false,
 *        type = "string"
 *     ),
 *     @SWG\Parameter(
 *        in = "body",
 *        name = "body",
 *        description = "json字符串结构",
 *        required = true,
 *        type = "string",
 *        schema = "{}"
 *     ),
 *     @SWG\Response(
 *         response = 200,
 *         description = "success"
 *     ))
 * )
 *
 */

/**
 * @SWG\Post(path="/delete",
 *     tags={""},
 *     summary="通用删除",
 *     description="返回删除结果",
 *       produces = {"application/json"},
 *       consumes = {"application/json"},
 *     @SWG\Parameter(
 *        in = "query",
 *        name = "id",
 *        description = "主键",
 *        required = false,
 *        type = "string"
 *     ),
 *     @SWG\Parameter(
 *        in = "body",
 *        name = "body",
 *        description = "json字符串结构",
 *        required = false,
 *        type = "string",
 *        schema = "{}"
 *     ),
 *     @SWG\Response(
 *         response = 200,
 *         description = "success"
 *     ))
 * )
 *
 */

/**
 * @SWG\Post(path="/view",
 *     tags={""},
 *     summary="通用实体查询",
 *     description="返回实体结果",
 *       produces = {"application/json"},
 *       consumes = {"application/json"},
 *     @SWG\Parameter(
 *        in = "query",
 *        name = "id",
 *        description = "主键",
 *        required = false,
 *        type = "string"
 *     ),
 *     @SWG\Parameter(
 *        in = "body",
 *        name = "body",
 *        description = "json字符串结构",
 *        required = false,
 *        type = "string",
 *        schema = "{}"
 *     ),
 *     @SWG\Response(
 *         response = 200,
 *         description = "success"
 *     ))
 * )
 *
 */