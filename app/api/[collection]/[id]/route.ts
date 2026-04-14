export async function PATCH(req: Request, { params }: { params: { collection: string, id: string } }) {
  const { collection, id } = params;
  const tableName = collection === 'forumTopics' ? 'forum_topics' : collection;
  const idColumn = tableName === 'users' ? 'uid' : 'id';

  try {
    const data = await req.json();
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const setClause = keys.map((key, i) => `${camelToSnake(key)} = $${i + 1}`).join(', ');
    const values = Object.values(data);

    await query(
      `UPDATE ${tableName} SET ${setClause} WHERE ${idColumn} = $${keys.length + 1}`,
      [...values, id]
    );

    // 🔔 Push Notification Logic

    // SERVICES
    if (collection === 'services' && data.status === 'accepted') {
      const serviceResult = await query(
        'SELECT user_id, title FROM services WHERE id = $1',
        [id]
      );

      if (serviceResult?.rowCount && serviceResult.rowCount > 0) {
        const service = serviceResult.rows[0];

        await sendPushNotification(service.user_id, {
          title: 'Service accepté',
          body: `Votre service "${service.title}" a été accepté.`,
          url: '/services'
        });
      }
    }

    // REQUESTS
    else if (collection === 'requests' && data.status === 'accepted') {
      const requestResult = await query(
        'SELECT user_id, title FROM requests WHERE id = $1',
        [id]
      );

      if (requestResult?.rowCount && requestResult.rowCount > 0) {
        const request = requestResult.rows[0];

        await sendPushNotification(request.user_id, {
          title: 'Demande acceptée',
          body: `Votre demande "${request.title}" a été acceptée !`,
          url: '/requests'
        });
      }
    }

    // CONNECTIONS
    else if (collection === 'connections' && data.status === 'accepted') {
      const connResult = await query(
        'SELECT sender_id FROM connections WHERE id = $1',
        [id]
      );

      if (connResult?.rowCount && connResult.rowCount > 0) {
        const conn = connResult.rows[0];

        await sendPushNotification(conn.sender_id, {
          title: 'Demande de connexion acceptée',
          body: `Votre demande de connexion a été acceptée.`,
          url: '/profile'
        });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(`Error updating ${collection}/${id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

